class Task {
  final String id;
  final String title;
  final String location;
  final String status;
  final DateTime createdAt;

  Task({
    required this.id,
    required this.title,
    required this.location,
    required this.status,
    required this.createdAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'],
      title: json['title'],
      location: json['location'],
      status: json['status'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
