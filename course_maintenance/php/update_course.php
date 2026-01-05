<?php
include '../../db.php';

header('Content-Type: application/json');
$response = ['status' => 'error', 'message' => 'Unexpected error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $course_id = $_POST['course_id'] ?? '';
    $course_code = trim($_POST['course_code'] ?? '');
    $title = trim($_POST['title'] ?? '');
    $lecture_hours = $_POST['lecture_hours'] ?? 0;
    $lab_hours = $_POST['lab_hours'] ?? 0;
    $units = $_POST['units'] ?? 0;

    if (empty($course_id) || empty($course_code) || empty($title)) {
        $response['message'] = 'Course ID, code, and title are required.';
    } else {
        $stmt = $conn->prepare("
            UPDATE tbl_course
            SET course_code = ?, title = ?, lecture_hours = ?, lab_hours = ?, units = ?
            WHERE course_id = ?
        ");

        if (!$stmt) {
            $response['message'] = 'Prepare failed: ' . $conn->error;
        } else {
            $stmt->bind_param("ssiiii", $course_code, $title, $lecture_hours, $lab_hours, $units, $course_id);
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    $response['status'] = 'success';
                    $response['message'] = 'Course updated successfully!';
                } else {
                    $response['message'] = 'No changes were made.';
                }
            } else {
                $response['message'] = 'Database error: ' . $stmt->error;
            }
            $stmt->close();
        }
    }
}

echo json_encode($response);
?>
