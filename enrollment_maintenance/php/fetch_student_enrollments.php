<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);

include '../../db.php';
header('Content-Type: application/json');

if ($conn->connect_error) {
    ob_end_clean();
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

$student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;

if ($student_id === 0) {
    ob_end_clean();
    echo json_encode(["status" => "error", "message" => "Invalid student ID provided."]);
    exit;
}

$sql = "
    SELECT 
        e.enrollment_id, 
        e.enrollment_type,
        e.status, 
        sec.section_code,
        c.course_code
    FROM 
        tbl_enrollment e
    INNER JOIN tbl_section sec ON e.section_id = sec.section_id
    INNER JOIN tbl_course c ON sec.course_id = c.course_id
    WHERE 
        e.student_id = ? AND 
        e.is_deleted = 0 AND 
        e.status IN ('Enrolled', 'Pending') /* Only show active enrollments */
    ORDER BY c.course_code ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $student_id);

if ($stmt->execute()) {
    $result = $stmt->get_result();
    $enrollments = [];
    while ($row = $result->fetch_assoc()) {
        $enrollments[] = $row;
    }
    
    ob_end_clean();
    echo json_encode(['status' => 'success', 'data' => $enrollments]);
} else {
    ob_end_clean();
    echo json_encode(["status" => "error", "message" => "SQL Error: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>