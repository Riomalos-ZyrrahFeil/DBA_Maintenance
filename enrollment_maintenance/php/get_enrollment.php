<?php
include '../../db.php';
header('Content-Type: application/json');

// =================== GET ONE ENROLLMENT FOR EDIT ===================
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("
        SELECT enrollment_id, student_id, section_id, date_enrolled, status, letter_grade
        FROM tbl_enrollment
        WHERE enrollment_id = ? AND is_deleted = 0
    ");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    echo json_encode($data);
    $stmt->close();
    exit;
}

// =================== SEARCH & SORT ===================

$search  = isset($_GET['search']) ? trim($conn->real_escape_string($_GET['search'])) : '';
$sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'enrollment_id';
$order   = (isset($_GET['order']) && strtolower($_GET['order']) === 'asc') ? 'ASC' : 'DESC';

$page  = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = ($page - 1) * $limit; // Calculate SQL OFFSET

// Whitelist of sortable columns to prevent SQL injection
$allowedSortColumns = ['enrollment_id', 'student_id', 'section_id', 'date_enrolled', 'status', 'letter_grade'];
if (!in_array($sort_by, $allowedSortColumns)) {
    $sort_by = 'enrollment_id';
}

$whereClause = "WHERE is_deleted = 0";
$searchParams = [];
$paramTypes = "";

if ($search !== '') {
    $searchLike = "%$search%";
    $whereClause .= " AND (student_id LIKE ? OR section_id LIKE ? OR status LIKE ? OR letter_grade LIKE ?)";
    $searchParams = [$searchLike, $searchLike, $searchLike, $searchLike];
    $paramTypes = "ssss";
}

$countSql = "SELECT COUNT(*) as total FROM tbl_enrollment $whereClause";
$totalRecords = 0;

if ($search !== '') {
    $stmtCount = $conn->prepare($countSql);
    $stmtCount->bind_param($paramTypes, ...$searchParams);
    $stmtCount->execute();
    $resultCount = $stmtCount->get_result();
    $totalRecords = $resultCount->fetch_assoc()['total'];
    $stmtCount->close();
} else {
    $resultCount = $conn->query($countSql);
    $totalRecords = $resultCount->fetch_assoc()['total'];
}

$dataSql = "
    SELECT enrollment_id, student_id, section_id, date_enrolled, status, letter_grade
    FROM tbl_enrollment
    $whereClause
    ORDER BY $sort_by $order
    LIMIT ? OFFSET ?
";

$enrollments = [];
$finalParams = array_merge($searchParams, [$limit, $offset]);
$finalTypes = $paramTypes . "ii";


$stmtData = $conn->prepare($dataSql);
$stmtData->bind_param($finalTypes, ...$finalParams);
$stmtData->execute();
$resultData = $stmtData->get_result();

while ($row = $resultData->fetch_assoc()) {
    $enrollments[] = $row;
}
$stmtData->close();

echo json_encode([
    'data' => $enrollments,
    'total_records' => $totalRecords
]);
?>