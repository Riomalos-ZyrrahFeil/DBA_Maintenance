<?php
include '../../db.php';
header('Content-Type: application/json');

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT enrollment_id, student_id, section_id, date_enrolled, status, letter_grade FROM tbl_enrollment WHERE enrollment_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    echo json_encode($data);
    $stmt->close();
} else {
    // Return all enrollments if no ID is given
    $result = $conn->query("SELECT enrollment_id, student_id, section_id, date_enrolled, status, letter_grade FROM tbl_enrollment ORDER BY enrollment_id DESC");
    $enrollments = [];
    while ($row = $result->fetch_assoc()) {
        $enrollments[] = $row;
    }
    echo json_encode($enrollments);
}
?>
