<?php
include '../../db.php';
header('Content-Type: application/json');

// 🆕 Updated query to join tbl_program and retrieve necessary fields
$sql = "
    SELECT 
        s.student_id, 
        s.student_name,
        s.year_level,               /* CRITICAL: The year and semester (e.g., '3-1') for block calculation */
        p.program_code              /* CRITICAL: The program base (e.g., 'DIT-TG') for block name construction */
    FROM tbl_student s
    LEFT JOIN tbl_program p ON s.program_id = p.program_id
    WHERE s.is_deleted = 0
    ORDER BY s.student_name ASC
";

$result = $conn->query($sql);

$students = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $students[] = $row;
    }
} else {
    // Return a clean error if the query fails
    echo json_encode(["status" => "error", "message" => "SQL Error in fetch_students: " . $conn->error]);
    $conn->close();
    exit;
}

echo json_encode($students);
$conn->close();
?>