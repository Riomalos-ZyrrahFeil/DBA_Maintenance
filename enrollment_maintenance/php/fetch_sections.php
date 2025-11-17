<?php
ob_start();
ini_set('display_errors', 0); 
error_reporting(E_ALL);

include '../../db.php';
header('Content-Type: application/json');

if (!$conn || $conn->connect_error) {
    ob_end_clean();
    echo json_encode(["status" => "error", "message" => "Connection failed."]);
    exit;
}

$sql = "
    SELECT 
        s.section_id, 
        s.section_code,
        s.year,
        s.day_pattern,
        TIME_FORMAT(s.start_time, '%h:%i %p') AS start_time,
        CONCAT(i.last_name, ', ', i.first_name) AS instructor_name,
        c.course_code,
        CONCAT(r.room_code, ' - ', r.building) AS room_name
    FROM tbl_section s
    LEFT JOIN tbl_instructor i ON s.instructor_id = i.instructor_id
    LEFT JOIN tbl_course c ON s.course_id = c.course_id
    LEFT JOIN tbl_room r ON s.room_id = r.room_id
    WHERE s.is_deleted = 0
    ORDER BY s.section_code ASC, s.start_time ASC
";

$result = $conn->query($sql);
$sections = [];

if (!$result) {
    ob_end_clean();
    echo json_encode(["status" => "error", "message" => "SQL Error: " . $conn->error]); 
    $conn->close();
    exit;
}
while ($row = $result->fetch_assoc()) {
    $row['display_text'] = $row['section_code'] . 
                            ' (' . ($row['course_code'] ?? 'N/A') . 
                            ' | ' . ($row['room_name'] ?? 'N/A') . 
                            ' | ' . $row['day_pattern'] . 
                            ' ' . $row['start_time'] . ')';
    $sections[] = $row;
}

ob_end_clean();
echo json_encode($sections);
$conn->close();
?>