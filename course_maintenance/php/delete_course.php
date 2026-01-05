<?php
include '../../db.php';

$response = [];

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);

    // Soft delete instead of permanent delete
    $stmt = $conn->prepare("UPDATE tbl_course SET is_deleted = 1 WHERE course_id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        $response['status'] = 'success';
        $response['message'] = 'Course deleted successfully.';
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Failed to delete course: ' . $stmt->error;
    }

    $stmt->close();
} else {
    $response['status'] = 'error';
    $response['message'] = 'No course ID provided.';
}

echo json_encode($response);
?>
