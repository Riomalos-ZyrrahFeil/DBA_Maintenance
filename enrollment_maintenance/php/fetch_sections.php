<?php
include '../../db.php';
header('Content-Type: application/json');

// Fetch section_id, section_code, and join with related tables for better display text
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
while ($row = $result->fetch_assoc()) {
    // Combine the code, instructor, and time to create a unique display label for each unique section_id
    $row['display_text'] = $row['section_code'] . 
                           ' (' . $row['day_pattern'] . 
                           ' ' . $row['start_time'] . 
                           ' - ' . (empty($row['instructor_name']) ? 'No Instructor' : $row['instructor_name']) . 
                           ')';
    $sections[] = $row;
}

echo json_encode($sections);
?>