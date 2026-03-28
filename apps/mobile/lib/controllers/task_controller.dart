import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../models/task_model.dart';
import '../services/api_service.dart';

class TaskController extends GetxController {
  final ApiService _apiService = Get.find<ApiService>();
  
  final RxList<Task> tasks = <Task>[].obs;
  final RxBool isLoading = true.obs;
  final RxBool isActionLoading = false.obs;

  List<Task> get pendingTasks => tasks.where((t) => t.status != 'Completed').toList();
  List<Task> get completedTasks => tasks.where((t) => t.status == 'Completed').toList();

  @override
  void onInit() {
    super.onInit();
    fetchTasks();

    // Listen to real-time broadcasts for newly created tasks
    _apiService.socket.on('task_created', (data) {
      Get.snackbar(
        'New Task Dispatched',
        data['title'] ?? 'A new task was assigned.',
        snackPosition: SnackPosition.TOP,
        backgroundColor: Get.theme.colorScheme.primaryContainer,
        colorText: Get.theme.colorScheme.onPrimaryContainer,
        duration: const Duration(seconds: 4),
        icon: const Icon(Icons.assignment, color: Colors.blue),
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
          'Success', 
          'Task "${task.title}" marked as completed!',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Get.theme.colorScheme.primaryContainer,
          colorText: Get.theme.colorScheme.onPrimaryContainer,
        );
        await fetchTasks();
      }
    } catch (e) {
      Get.log('Failed to complete task: $e');
    } finally {
      isActionLoading.value = false;
    }
  }
}
