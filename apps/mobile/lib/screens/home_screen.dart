import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/task_controller.dart';
import '../models/task_model.dart';
import '../services/api_service.dart';

class HomeScreen extends StatelessWidget {
  HomeScreen({super.key});

  final TaskController controller = Get.put(TaskController());
  final ApiService apiService = Get.find<ApiService>();

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.asset(
                  'assets/logo.jpg', 
                  height: 28, 
                  errorBuilder: (context, error, stackTrace) => const SizedBox()
                ),
              ),
              const SizedBox(width: 10),
              const Text('Field Tasks'),
            ],
          ),
          forceMaterialTransparency: true,
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Pending'),
              Tab(text: 'Completed'),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: () => controller.fetchTasks(),
            )
          ],
        ),
        body: Column(
          children: [
            // Offline Warning Banner
            Obx(() {
              if (apiService.isOffline.value) {
                return Container(
                  width: double.infinity,
                  color: Colors.red.shade500,
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                  child: const Text(
                    '⚠️ You are currently offline. Retrying...',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                    textAlign: TextAlign.center,
                  ),
                );
              }
              return const SizedBox.shrink();
            }),
            Expanded(
              child: TabBarView(
                children: [
                  _buildTaskList(filteredTasks: controller.pendingTasks, isPendingTab: true),
                  _buildTaskList(filteredTasks: controller.completedTasks, isPendingTab: false),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskList({required List<Task> filteredTasks, required bool isPendingTab}) {
    return Obx(() {
      if (controller.isLoading.value && controller.tasks.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }
      
      final tasks = isPendingTab ? controller.pendingTasks : controller.completedTasks;
      
      if (tasks.isEmpty) {
        return Center(
          child: Text(isPendingTab ? 'No pending tasks to show.' : 'No completed tasks yet.'),
        );
      }

      return RefreshIndicator(
        onRefresh: controller.fetchTasks,
        child: ListView.builder(
          itemCount: tasks.length,
          itemBuilder: (context, index) {
            final task = tasks[index];
            return _buildTaskCard(task);
          },
        ),
      );
    });
  }

  Widget _buildTaskCard(Task task) {
    final bool isCompleted = task.status == 'Completed';

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    task.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isCompleted ? Colors.green.shade100 : Colors.amber.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    task.status,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isCompleted ? Colors.green.shade800 : Colors.amber.shade900,
                    ),
                  ),
                )
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.location_on, size: 16, color: Colors.grey),
                const SizedBox(width: 4),
                Text(
                  task.location,
                  style: const TextStyle(color: Colors.grey, fontSize: 14),
                ),
              ],
            ),
            if (!isCompleted) ...[
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: Obx(() => ElevatedButton(
                  onPressed: controller.isActionLoading.value
                      ? null
                      : () => _confirmCompletion(task),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Get.theme.colorScheme.primary,
                    foregroundColor: Get.theme.colorScheme.onPrimary,
                  ),
                  child: const Text('Mark as Completed'),
                )),
              )
            ]
          ],
        ),
      ),
    );
  }

  void _confirmCompletion(Task task) {
    Get.defaultDialog(
      title: 'Complete Task',
      middleText: 'Are you sure you want to mark "${task.title}" as completed?',
      textConfirm: 'Yes',
      textCancel: 'No',
      confirmTextColor: Colors.white,
      onConfirm: () {
        Get.back(); // close dialog
        controller.completeTask(task);
      },
      onCancel: () {},
    );
  }
}
