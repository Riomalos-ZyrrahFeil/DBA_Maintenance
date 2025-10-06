<?php
include '../../db.php';

$response = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $course_code = $_POST['course_code'];
    $title = $_POST['title'];
    $lecture_hours = $_POST['lecture_hours'];
    $lab_hours = $_POST['lab_hours'];
    $units = $_POST['units'];

    $stmt = $conn->prepare("INSERT INTO tbl_course (course_code, title, lecture_hours, lab_hours, units) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssiii", $course_code, $title, $lecture_hours, $lab_hours, $units);

    if ($stmt->execute()) {
        $response['status'] = 'success';
        $response['message'] = 'Course added successfully';
    } else {
        $response['status'] = 'error';
        $response['message'] = $stmt->error;
    }

    $stmt->close();
}

echo json_encode($response);
?>
