import 'package:dio/dio.dart';
import 'package:dio_smart_retry/dio_smart_retry.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:get/get.dart' hide Response, FormData, MultipartFile;
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:socket_io_client/socket_io_client.dart' as socket_io;
import 'package:flutter/material.dart';

class ApiService extends GetxService {
  late final Dio dio;
  late final socket_io.Socket socket;
  final RxBool isOffline = false.obs;

  @override
  void onInit() {
    super.onInit();
    
    final apiURL = dotenv.env['API_URL'] ?? 'http://10.0.2.2:3001';

    dio = Dio(BaseOptions(
      baseUrl: apiURL,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    // Initialize WebSockets
    socket = socket_io.io(apiURL, socket_io.OptionBuilder()
      .setTransports(['websocket'])
      .disableAutoConnect()
      .build()
    );
    socket.connect();

    // Smart Retry for erratic connections
    dio.interceptors.add(RetryInterceptor(
      dio: dio,
      logPrint: print,
      retries: 3, 
      retryDelays: const [
        Duration(seconds: 1), 
        Duration(seconds: 2), 
        Duration(seconds: 3),
      ],
    ));

    // Global Error Handler for timeouts and server issues
    dio.interceptors.add(InterceptorsWrapper(
      onError: (DioException e, handler) {
        String msg = 'An unexpected error occurred.';
        if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout) {
          msg = 'Connection timeout (10s exceeded). Please try again.';
        } else if (e.type == DioExceptionType.connectionError) {
          msg = 'No internet connection. Retrying failed.';
        } else if (e.response != null && e.response!.statusCode! >= 500) {
          msg = 'Server error. Please try again later.';
        }

        if (!Get.isSnackbarOpen) {
          Get.snackbar(
            'Connection Issue',
            msg,
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.red.shade800,
            colorText: Colors.white,
            margin: const EdgeInsets.all(16),
            borderRadius: 16,
            boxShadows: [
              const BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 5))
            ],
            icon: const Icon(Icons.wifi_off, color: Colors.white),
            shouldIconPulse: true,
            duration: const Duration(seconds: 4),
          );
        }
        return handler.next(e);
      },
    ));

    // Listen to network changes
    Connectivity().onConnectivityChanged.listen((List<ConnectivityResult> results) {
       if (results.contains(ConnectivityResult.none)) {
         isOffline.value = true;
       } else {
         isOffline.value = false;
       }
    });

    _checkInitialConnectivity();
  }

  Future<void> _checkInitialConnectivity() async {
    final results = await Connectivity().checkConnectivity();
    if (results.contains(ConnectivityResult.none)) {
      isOffline.value = true;
    }
  }

  Future<Response> fetchTasks() => dio.get('/tasks');
  
  Future<Response> completeTask(String id) => dio.patch(
    '/tasks/$id',
    data: {'status': 'Completed', 'source': 'engineer'}
  );
}
