<?php
include '../../db.php';

$response = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $course_id = $_POST['course_id'];
    $course_code = $_POST['course_code'];
    $title = $_POST['title'];
    $lecture_hours = $_POST['lecture_hours'];
    $lab_hours = $_POST['lab_hours'];
    $units = $_POST['units'];

    $stmt = $conn->prepare("UPDATE tbl_course SET course_code=?, title=?, lecture_hours=?, lab_hours=?, units=? WHERE course_id=?");
    $stmt->bind_param("ssiiii", $course_code, $title, $lecture_hours, $lab_hours, $units, $course_id);

    if ($stmt->execute()) {
        $response['status'] = 'success';
        $response['message'] = 'Course updated successfully';
    } else {
        $response['status'] = 'error';
        $response['message'] = $stmt->error;
    }

    $stmt->close();
}

echo json_encode($response);
?>
