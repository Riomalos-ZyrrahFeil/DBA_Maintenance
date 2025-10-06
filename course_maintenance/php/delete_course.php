<?php
include '../../db.php';

$response = [];

if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM tbl_course WHERE course_id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        $response['status'] = 'success';
        $response['message'] = 'Course deleted successfully';
    } else {
        $response['status'] = 'error';
        $response['message'] = $stmt->error;
    }

    $stmt->close();
} else {
    $response['status'] = 'error';
    $response['message'] = 'No course ID provided';
}

echo json_encode($response);
?>
