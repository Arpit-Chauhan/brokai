class AppNotification {
  final String id;
  final String title;
  final String message;
  final String icon;
  final DateTime timestamp;
  bool read;

  AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.icon,
    required this.timestamp,
    this.read = false,
  });
}
