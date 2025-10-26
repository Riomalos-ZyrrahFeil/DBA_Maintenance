<?php
include '../../db.php';

$page = (int) ($_GET['page'] ?? 1);
$limit = (int) ($_GET['limit'] ?? 10);
$offset = ($page - 1) * $limit;

// Optional filters and sorting
$search = trim($_GET['search'] ?? '');
$sort_by = $_GET['sort_by'] ?? 'student_id';
$order = strtoupper($_GET['order'] ?? 'DESC');

// Validate sorting and limit/offset
if (!in_array($order, ['ASC', 'DESC'])) {
    $order = 'DESC';
}
$allowed_sort_columns = ['student_id', 'student_no', 'student_name', 'email', 'gender', 'birthdate', 'year_level', 'program_id'];
if (!in_array($sort_by, $allowed_sort_columns)) {
    $sort_by = 'student_id';
}
if ($limit <= 0) $limit = 10;
if ($offset < 0) $offset = 0;

$count_sql = "SELECT COUNT(*) as total FROM tbl_student WHERE is_deleted = 0";
if ($search !== '') {
    $count_sql .= " AND (student_name LIKE ? OR student_no LIKE ?)";
}

$count_stmt = $conn->prepare($count_sql);
if ($search !== '') {
    $search_term = "%$search%";
    $count_stmt->bind_param("ss", $search_term, $search_term);
}
$count_stmt->execute();
$count_result = $count_stmt->get_result();
$total_records = $count_result->fetch_assoc()['total'];

$select_sql = "SELECT * FROM tbl_student 
               WHERE is_deleted = 0";

if ($search !== '') {
    $select_sql .= " AND (student_name LIKE ? OR student_no LIKE ?)";
}

$select_sql .= " ORDER BY $sort_by $order 
                 LIMIT ? OFFSET ?";

$stmt = $conn->prepare($select_sql);

if ($search !== '') {
    $search_term = "%$search%";
    $stmt->bind_param("ssii", $search_term, $search_term, $limit, $offset);
} else {
    $stmt->bind_param("ii", $limit, $offset);
}

$stmt->execute();
$result = $stmt->get_result();

$students = [];
while ($row = $result->fetch_assoc()) {
    $students[] = $row;
}

echo json_encode([
    'data' => $students,
    'total_records' => $total_records,
    'current_page' => $page,
    'per_page' => $limit
]);
?>