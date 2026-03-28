import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../models/task_model.dart';
import '../services/api_service.dart';

class TaskController extends GetxController {
  final ApiService _apiService = Get.find<ApiService>();
  
  final RxList<Task> tasks = <Task>[].obs;
  final RxBool isLoading = true.obs;
  final RxBool isActionLoading = false.obs;
  final RxBool isDarkTheme = false.obs;

  List<Task> get pendingTasks {
    final list = tasks.where((t) => t.status != 'Completed').toList();
    list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  }
  
  List<Task> get completedTasks {
    final list = tasks.where((t) => t.status == 'Completed').toList();
    list.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    return list;
  }

  @override
  void onInit() {
    super.onInit();
    // Initialize theme based on current system/app mode
    WidgetsBinding.instance.addPostFrameCallback((_) {
      isDarkTheme.value = Get.isDarkMode;
    });
    fetchTasks();

    // Listen to real-time broadcasts for newly created tasks
    _apiService.socket.on('task_created', (data) {
      Get.snackbar(
        '',
        '',
        titleText: const Text(
          'New Task Dispatched!', 
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 0.5)
        ),
        messageText: Text(
          data['title'] ?? 'A new task was officially assigned to the field.', 
          style: const TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w500)
        ),
        snackPosition: SnackPosition.TOP,
        backgroundColor: const Color(0xFF1E293B), // slate-800
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        borderRadius: 16,
        boxShadows: [
          const BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, 4))
        ],
        icon: Container(
          margin: const EdgeInsets.only(left: 8),
          child: const Icon(Icons.rocket_launch_rounded, color: Colors.blueAccent, size: 28),
        ),
        shouldIconPulse: true,
        duration: const Duration(seconds: 5),
        isDismissible: true,
        forwardAnimationCurve: Curves.easeOutBack, // snappy modern pop-in
      );
      _silentFetch();
    });

    _apiService.socket.on('task_completed', (data) {
      _silentFetch();
    });
  }

  Future<void> _silentFetch() async {
    try {
      final response = await _apiService.fetchTasks();
      if (response.statusCode == 200 && response.data != null) {
        final List<dynamic> data = response.data;
        tasks.value = data.map((json) => Task.fromJson(json)).toList();
      }
    } catch (e) {
      // ignore silently on background fetch
    }
  }

  Future<void> fetchTasks() async {
    isLoading.value = true;
    try {
      final response = await _apiService.fetchTasks();
      if (response.statusCode == 200 && response.data != null) {
        final List<dynamic> data = response.data;
        tasks.value = data.map((json) => Task.fromJson(json)).toList();
      }
    } catch (e) {
      Get.log('Failed to parse tasks: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> completeTask(Task task) async {
    isActionLoading.value = true;
    try {
      final response = await _apiService.completeTask(task.id);
      if (response.statusCode == 200 || response.statusCode == 201) {
        Get.snackbar(
          'Task Completed!', 
          '${task.title} was synced securely to the cloud.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.green.shade800,
          colorText: Colors.white,
          margin: const EdgeInsets.all(16),
          borderRadius: 16,
          boxShadows: [
            const BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 5))
          ],
          icon: const Icon(Icons.check_circle, color: Colors.white),
          shouldIconPulse: false,
        );
        await fetchTasks();
      }
    } catch (e) {
      Get.log('Failed to complete task: $e');
    } finally {
      isActionLoading.value = false;
    }
  }

  void toggleTheme() {
    isDarkTheme.value = !isDarkTheme.value;
    Get.changeThemeMode(isDarkTheme.value ? ThemeMode.dark : ThemeMode.light);
  }
}
