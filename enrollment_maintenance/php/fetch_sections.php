<?php
// CRITICAL: Ensure robust error handling is present
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

// 🆕 FINAL QUERY: Includes joins to tbl_course and tbl_room for descriptive display
$sql = "
    SELECT 
        s.section_id, 
        s.section_code,
        s.day_pattern,
        TIME_FORMAT(s.start_time, '%h:%i %p') AS start_time,
        CONCAT(i.last_name, ', ', i.first_name) AS instructor_name
    FROM tbl_section s
    LEFT JOIN tbl_instructor i ON s.instructor_id = i.instructor_id
    WHERE s.is_deleted = 0
    ORDER BY s.section_code ASC, s.start_time ASC
";

$result = $conn->query($sql);
$sections = [];

if (!$result) {
    ob_end_clean();
    // This will now catch any remaining JOIN/CONCAT/TIME_FORMAT errors cleanly
    echo json_encode(["status" => "error", "message" => "FINAL SQL Error: " . $conn->error]); 
    $conn->close();
    exit;
}
// add ko to sa enrollment flow
while ($row = $result->fetch_assoc()) {
    // 🆕 Create the descriptive display text
    $row['display_text'] = $row['section_code'] . 
                           ' (' . ($row['course_code'] ?? 'N/A') . // Null-safe display
                           ' | ' . ($row['room_name'] ?? 'N/A') . // Null-safe display
                           ' | ' . $row['day_pattern'] . 
                           ' ' . $row['start_time'] . ')';
    $sections[] = $row;
}

ob_end_clean();
echo json_encode($sections);
$conn->close();
?>