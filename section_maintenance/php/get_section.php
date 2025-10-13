<?php
include '../../db.php';
header('Content-Type: application/json');

// Get query parameters
$search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : '';
$sort_by = isset($_GET['sort_by']) ? $conn->real_escape_string($_GET['sort_by']) : 'section_id';
$order = isset($_GET['order']) && strtolower($_GET['order']) === 'desc' ? 'DESC' : 'ASC';

// List of allowed columns to prevent SQL injection
$allowedColumns = [
    'section_id','course_code','term_code','instructor_name','room_name',
    'section_code','year','day_pattern','start_time','end_time','max_capacity'
];
if (!in_array($sort_by, $allowedColumns)) {
    $sort_by = 'section_id';
}

// Base SQL query
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
        LEFT JOIN tbl_room r ON s.room_id = r.room_id
        WHERE s.is_deleted = 0";

// Apply search if provided
if ($search !== '') {
    $search = "%$search%";
    $sql .= " AND (
        c.course_code LIKE '$search' OR
        t.term_code LIKE '$search' OR
        CONCAT(i.last_name, ', ', i.first_name) LIKE '$search' OR
        CONCAT(r.room_code, ' - ', r.building) LIKE '$search' OR
        s.section_code LIKE '$search' OR
        s.year LIKE '$search' OR
        s.day_pattern LIKE '$search' OR
        s.start_time LIKE '$search' OR
        s.end_time LIKE '$search' OR
        s.max_capacity LIKE '$search'
    )";
}

// Apply sorting
$sql .= " ORDER BY $sort_by $order";

$result = $conn->query($sql);
$sections = [];

if($result && $result->num_rows > 0){
    while($row = $result->fetch_assoc()){
        $sections[] = $row;
    }
}

echo json_encode($sections);
$conn->close();
?>
