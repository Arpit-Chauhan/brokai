import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/task_controller.dart';
import '../models/notification_model.dart';

class NotificationScreen extends StatelessWidget {
  NotificationScreen({super.key});

  final TaskController controller = Get.find<TaskController>();

  String _timeAgo(DateTime d) {
    final diff = DateTime.now().difference(d);
    if (diff.inSeconds < 60) return '${diff.inSeconds}s ago';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF0f1117) : const Color(0xFFF0F4FA);
    final cardBg = isDark ? const Color(0xFF1a1d27) : Colors.white;
    final textPrimary = isDark ? Colors.white : const Color(0xFF1a1d27);
    final textSecondary = isDark ? Colors.grey.shade500 : Colors.grey.shade600;

    // Mark all read after build completes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (controller.notifications.isNotEmpty) {
        controller.markAllRead();
      }
    });

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: cardBg,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_rounded, color: textPrimary),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Notifications',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: textPrimary, letterSpacing: -0.5),
        ),
        actions: [
          Obx(
            () => controller.notifications.isNotEmpty
                ? TextButton(
                    onPressed: () {
                      controller.clearNotifications();
                    },
                    child: Text(
                      'Clear All',
                      style: TextStyle(color: Colors.red.shade500, fontWeight: FontWeight.w700, fontSize: 13),
                    ),
                  )
                : const SizedBox.shrink(),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Obx(() {
        if (controller.notifications.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.notifications_off_outlined, size: 64, color: textSecondary.withOpacity(0.3)),
                const SizedBox(height: 20),
                Text(
                  'No notifications yet',
                  style: TextStyle(color: textSecondary, fontSize: 16, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                Text(
                  'Notifications from dispatched and\ncompleted tasks will appear here.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: textSecondary.withOpacity(0.6), fontSize: 13, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          );
        }

        return ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          itemCount: controller.notifications.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (context, index) {
            final n = controller.notifications[index];
            return _buildNotificationCard(n, isDark, cardBg, textPrimary, textSecondary);
          },
        );
      }),
    );
  }

  Widget _buildNotificationCard(AppNotification n, bool isDark, Color cardBg, Color textPrimary, Color textSecondary) {
    final isTaskCompleted = n.title.contains('Completed');
    final accentColor = isTaskCompleted ? Colors.green.shade600 : const Color(0xFF2563EB);

    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(isDark ? 0.2 : 0.04), blurRadius: 12, offset: const Offset(0, 2))],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon container
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(color: accentColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
              child: Center(child: Text(n.icon, style: const TextStyle(fontSize: 20))),
            ),
            const SizedBox(width: 14),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          n.title,
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: textPrimary),
                        ),
                      ),
                      Text(
                        _timeAgo(n.timestamp),
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: textSecondary.withOpacity(0.6)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    n.message,
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: textSecondary),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
