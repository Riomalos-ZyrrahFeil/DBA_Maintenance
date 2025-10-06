<?php
include '../../db.php';

header('Content-Type: application/json');

$id = $_GET['id'] ?? '';

if ($id) {
    // Fetch single enrollment
    $stmt = $conn->prepare("SELECT * FROM tbl_enrollment WHERE enrollment_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $enrollment = $result->fetch_assoc();
    echo json_encode($enrollment);
    $stmt->close();
} else {
    // Fetch all enrollments
    $result = $conn->query("SELECT * FROM tbl_enrollment ORDER BY enrollment_id DESC");
    $enrollments = [];
    while ($row = $result->fetch_assoc()) {
        $enrollments[] = $row;
    }
    echo json_encode($enrollments);
}
?>
