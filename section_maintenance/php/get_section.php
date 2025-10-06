<?php
include '../../db.php';
header('Content-Type: application/json');

$sql = "SELECT s.section_id,
        c.course_code,
        t.term_code,
        CONCAT(i.last_name, ', ', i.first_name) AS instructor_name,
        CONCAT(r.room_code, ' - ', r.building) AS room_name,
        s.section_code,
        s.year,
        s.day_pattern,
        s.start_time,
        s.end_time,
        s.max_capacity
        FROM tbl_section s
        LEFT JOIN tbl_course c ON s.course_id = c.course_id
        LEFT JOIN tbl_term t ON s.term_id = t.term_id
        LEFT JOIN tbl_instructor i ON s.instructor_id = i.instructor_id
        LEFT JOIN tbl_room r ON s.room_id = r.room_id";

$result = $conn->query($sql);
$sections = [];

if($result->num_rows > 0){
    while($row = $result->fetch_assoc()){
        $sections[] = $row;
    }
}

echo json_encode($sections);
$conn->close();
?>
