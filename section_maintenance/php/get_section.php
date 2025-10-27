<?php
include '../../db.php';
header('Content-Type: application/json');

$page = (int) ($_GET['page'] ?? 1);
$limit = (int) ($_GET['limit'] ?? 10);
$offset = ($page - 1) * $limit;

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

$base_joins = " FROM tbl_section s
               LEFT JOIN tbl_course c ON s.course_id = c.course_id
               LEFT JOIN tbl_term t ON s.term_id = t.term_id
               LEFT JOIN tbl_instructor i ON s.instructor_id = i.instructor_id
               LEFT JOIN tbl_room r ON s.room_id = r.room_id
               WHERE s.is_deleted = 0";

$where_clause = "";
if ($search !== '') {
    $search_term = "%$search%";
    $where_clause = " AND (
        c.course_code LIKE '$search_term' OR
        t.term_code LIKE '$search_term' OR
        CONCAT(i.last_name, ', ', i.first_name) LIKE '$search_term' OR
        CONCAT(r.room_code, ' - ', r.building) LIKE '$search_term' OR
        s.section_code LIKE '$search_term' 
    )";
}

$count_sql = "SELECT COUNT(s.section_id) as total" . $base_joins . $where_clause;
$count_result = $conn->query($count_sql);
$total_records = $count_result ? $count_result->fetch_assoc()['total'] : 0;


$select_sql = "SELECT s.section_id,
                    c.course_code,
                    t.term_code,
                    CONCAT(i.last_name, ', ', i.first_name) AS instructor_name,
                    CONCAT(r.room_code, ' - ', r.building) AS room_name,
                    s.section_code,
                    s.year,
                    s.day_pattern,
                    TIME_FORMAT(s.start_time, '%h:%i %p') AS start_time,
                    TIME_FORMAT(s.end_time, '%h:%i %p') AS end_time,
                    s.max_capacity,
                    s.course_id, s.term_id, s.instructor_id, s.room_id
               " . $base_joins 
                 . $where_clause 
                 . " ORDER BY $sort_by $order 
                 LIMIT $limit OFFSET $offset";

$result = $conn->query($select_sql);
$sections = [];

if($result){
    while($row = $result->fetch_assoc()){
        $sections[] = $row;
    }
}

echo json_encode([
    'data' => $sections,
    'total_records' => $total_records,
    'current_page' => $page,
    'per_page' => $limit
]);

$conn->close();
?>