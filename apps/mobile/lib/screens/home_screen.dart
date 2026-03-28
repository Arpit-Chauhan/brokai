import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/task_controller.dart';
import '../models/task_model.dart';
import '../services/api_service.dart';
import 'notification_screen.dart';

class HomeScreen extends StatelessWidget {
  HomeScreen({super.key});

  final TaskController controller = Get.put(TaskController());
  final ApiService apiService = Get.find<ApiService>();

  String _formatDate(DateTime d) {
    final day = d.day.toString().padLeft(2, '0');
    final month = d.month.toString().padLeft(2, '0');
    final year = d.year;
    final hour = d.hour.toString().padLeft(2, '0');
    final min = d.minute.toString().padLeft(2, '0');
    return '$day/$month/$year $hour:$min';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF0f1117) : const Color(0xFFF0F4FA);
    final cardBg = isDark ? const Color(0xFF1a1d27) : Colors.white;
    final textPrimary = isDark ? Colors.white : const Color(0xFF1a1d27);
    final textSecondary = isDark ? Colors.grey.shade500 : Colors.grey.shade600;
    final dividerColor = isDark ? const Color(0xFF2a2d3a) : Colors.grey.shade200;

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: bgColor,
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: AppBar(
            backgroundColor: cardBg,
            surfaceTintColor: Colors.transparent,
            elevation: 0,
            title: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.asset(
                    'assets/logo.jpg',
                    height: 32,
                    width: 32,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) =>
                        Container(
                          height: 32, width: 32,
                          decoration: BoxDecoration(
                            color: Colors.blue.shade600,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.bolt, color: Colors.white, size: 20),
                        ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Field Tasks',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 20,
                    color: textPrimary,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
            actions: [
              Obx(() => IconButton(
                icon: Icon(
                  controller.isDarkTheme.value ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                  color: textSecondary,
                  size: 22,
                ),
                onPressed: controller.toggleTheme,
              )),
              Obx(() {
                final count = controller.unreadCount;
                return Stack(
                  children: [
                    IconButton(
                      icon: Icon(Icons.notifications_none_rounded, color: textSecondary, size: 24),
                      onPressed: () => Get.to(() => NotificationScreen()),
                    ),
                    if (count > 0)
                      Positioned(
                        right: 6,
                        top: 6,
                        child: Container(
                          width: 18,
                          height: 18,
                          decoration: BoxDecoration(
                            color: Colors.red.shade500,
                            shape: BoxShape.circle,
                            border: Border.all(color: cardBg, width: 2),
                          ),
                          child: Center(
                            child: Text(
                              count > 9 ? '9+' : '$count',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],
                );
              }),
              const SizedBox(width: 4),
            ],
          ),
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

            // Custom Tabs
            Container(
              color: cardBg,
              child: _buildTabs(isDark, textPrimary, textSecondary, dividerColor),
            ),

            // Tab Content
            Expanded(
              child: TabBarView(
                children: [
                  _buildTaskList(isPendingTab: true, isDark: isDark, cardBg: cardBg, textPrimary: textPrimary, textSecondary: textSecondary, dividerColor: dividerColor),
                  _buildTaskList(isPendingTab: false, isDark: isDark, cardBg: cardBg, textPrimary: textPrimary, textSecondary: textSecondary, dividerColor: dividerColor),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabs(bool isDark, Color textPrimary, Color textSecondary, Color dividerColor) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF22252f) : const Color(0xFFF0F4FA),
        borderRadius: BorderRadius.circular(14),
      ),
      padding: const EdgeInsets.all(4),
      child: TabBar(
        indicatorSize: TabBarIndicatorSize.tab,
        indicator: BoxDecoration(
          color: isDark ? const Color(0xFF1a1d27) : Colors.white,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        dividerHeight: 0,
        labelColor: const Color(0xFF2563EB),
        unselectedLabelColor: textSecondary,
        labelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
        unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
        tabs: [
          Obx(() => Tab(text: 'Pending (${controller.pendingTasks.length})')),
          Obx(() => Tab(text: 'Completed (${controller.completedTasks.length})')),
        ],
      ),
    );
  }

  Widget _buildTaskList({
    required bool isPendingTab,
    required bool isDark,
    required Color cardBg,
    required Color textPrimary,
    required Color textSecondary,
    required Color dividerColor,
  }) {
    return Obx(() {
      if (controller.isLoading.value && controller.tasks.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }

      final tasks = isPendingTab ? controller.pendingTasks : controller.completedTasks;

      if (tasks.isEmpty) {
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isPendingTab ? Icons.assignment_outlined : Icons.task_alt,
                size: 56,
                color: textSecondary.withOpacity(0.4),
              ),
              const SizedBox(height: 16),
              Text(
                isPendingTab ? 'No pending tasks to show.' : 'No completed tasks yet.',
                style: TextStyle(color: textSecondary, fontSize: 15, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        );
      }

      return RefreshIndicator(
        onRefresh: controller.fetchTasks,
        color: const Color(0xFF2563EB),
        child: ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          itemCount: tasks.length,
          itemBuilder: (context, index) {
            final task = tasks[index];
            return _buildTaskCard(task, isDark, cardBg, textPrimary, textSecondary);
          },
        ),
      );
    });
  }

  Widget _buildTaskCard(Task task, bool isDark, Color cardBg, Color textPrimary, Color textSecondary) {
    final bool isCompleted = task.status == 'Completed';

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.25 : 0.06),
            blurRadius: 16,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            // Card content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Row 1: Title + Status Badge
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            task.title,
                            style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w800,
                              color: textPrimary,
                              height: 1.35,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: isCompleted
                                ? (isDark ? Colors.green.withOpacity(0.15) : Colors.green.shade50)
                                : (isDark ? const Color(0xFFE25822).withOpacity(0.15) : const Color(0xFFFEECE2)),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            task.status.toUpperCase(),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: isCompleted ? Colors.green.shade700 : const Color(0xFFE25822),
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 14),

                    // Row 2: Location with blue pin
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on_rounded,
                          size: 16,
                          color: Colors.blue,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            task.location,
                            style: TextStyle(
                              color: textPrimary,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        // Mark Done button for pending
                        if (!isCompleted)
                          Obx(() => Material(
                            color: const Color(0xFF2563EB),
                            borderRadius: BorderRadius.circular(8),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(8),
                              onTap: controller.isActionLoading.value
                                  ? null
                                  : () => _confirmCompletion(task),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                                child: Text(
                                  'Mark Done',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.3,
                                  ),
                                ),
                              ),
                            ),
                          )),
                      ],
                    ),

                    const SizedBox(height: 14),

                    // Row 3: Created date + avatar initials
                    Row(
                      children: [
                        Text(
                          'Created: ${_formatDate(task.createdAt)}',
                          style: TextStyle(
                            color: textSecondary.withOpacity(0.6),
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const Spacer(),
                        if (isCompleted)
                          Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: Text(
                              'Done: ${_formatDate(task.updatedAt)}',
                              style: TextStyle(
                                color: Colors.green.shade600,
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmCompletion(Task task) {
    final isDark = Get.isDarkMode;
    Get.dialog(
      AlertDialog(
        backgroundColor: isDark ? const Color(0xFF22252f) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Complete Task?',
          style: TextStyle(
            fontWeight: FontWeight.w900,
            color: isDark ? Colors.white : const Color(0xFF1a1d27),
          ),
        ),
        content: Text(
          'Mark "${task.title}" as completed?',
          style: TextStyle(
            color: isDark ? Colors.grey.shade400 : Colors.grey.shade700,
            fontWeight: FontWeight.w500,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text(
              'Cancel',
              style: TextStyle(
                color: isDark ? Colors.grey.shade500 : Colors.grey.shade600,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Get.back();
              controller.completeTask(task);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            ),
            child: const Text('Yes, Complete', style: TextStyle(fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }
}
