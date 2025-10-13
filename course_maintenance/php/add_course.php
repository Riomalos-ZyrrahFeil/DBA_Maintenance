<?php
include '../../db.php';

header('Content-Type: application/json');
$response = ['status' => 'error', 'message' => 'Unexpected error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $course_code = trim($_POST['course_code'] ?? '');
    $title = trim($_POST['title'] ?? '');
    $lecture_hours = $_POST['lecture_hours'] ?? 0;
    $lab_hours = $_POST['lab_hours'] ?? 0;
    $units = $_POST['units'] ?? 0;

    // Basic validation
    if (empty($course_code) || empty($title)) {
        $response['message'] = 'Course code and title are required.';
    } else {
        $stmt = $conn->prepare("
            INSERT INTO tbl_course (course_code, title, lecture_hours, lab_hours, units)
            VALUES (?, ?, ?, ?, ?)
        ");

        if (!$stmt) {
            $response['message'] = 'Prepare failed: ' . $conn->error;
        } else {
            $stmt->bind_param("ssiii", $course_code, $title, $lecture_hours, $lab_hours, $units);
            if ($stmt->execute()) {
                $response['status'] = 'success';
                $response['message'] = '✅ Course added successfully!';
            } else {
                // Handle common issues like duplicate entries
                if ($conn->errno == 1062) {
                    $response['message'] = 'Course code already exists!';
                } else {
                    $response['message'] = 'Database error: ' . $stmt->error;
                }
            }
            $stmt->close();
        }
    }
}

echo json_encode($response);
?>
