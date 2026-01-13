<?php
include '../../db.php';
header('Content-Type: application/json');

$sql = "
    SELECT 
        s.student_id, 
        s.student_name,
        s.year_level,
        p.program_code,
        /* LOGIC: Identify Irregular status if failed grades exist */
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM tbl_enrollment e 
                WHERE e.student_id = s.student_id 
                AND e.letter_grade IN ('D', 'F', 'INC') 
                AND e.is_deleted = 0
            ) THEN 'Irregular' 
            ELSE 'Regular' 
        END AS status
    FROM tbl_student s
    LEFT JOIN tbl_program p ON s.program_id = p.program_id
    WHERE s.is_deleted = 0
    ORDER BY s.student_name ASC
";

$result = $conn->query($sql);
$students = [];
if ($result) {
    while ($row = $result->fetch_assoc()) { $students[] = $row; }
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
    exit;
}
echo json_encode($students);
$conn->close();
?>