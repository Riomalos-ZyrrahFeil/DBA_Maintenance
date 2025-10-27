<?php
include '../../db.php';
header('Content-Type: application/json');

// =================== GET ONE ENROLLMENT FOR EDIT (Unchanged) ===================
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    // When editing, we still need the IDs to pre-select the dropdowns in the modal
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

// =================== SEARCH, SORT, and PAGINATION ===================

$search  = isset($_GET['search']) ? trim($conn->real_escape_string($_GET['search'])) : '';
$sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'enrollment_id';
$order   = (isset($_GET['order']) && strtolower($_GET['order']) === 'asc') ? 'ASC' : 'DESC';

$page  = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = ($page - 1) * $limit;

// Whitelist of sortable columns. Include the joined table columns for sorting.
$allowedSortColumns = ['enrollment_id', 'student_name', 'section_code', 'date_enrolled', 'status', 'letter_grade'];
if (!in_array($sort_by, $allowedSortColumns)) {
    $sort_by = 'enrollment_id';
}

// Map the display column names back to their table/alias for sorting
$columnMap = [
    'enrollment_id' => 'e.enrollment_id',
    'student_name' => 's.student_name',
    'section_code' => 'sec.section_code',
    'date_enrolled' => 'e.date_enrolled',
    'status' => 'e.status',
    'letter_grade' => 'e.letter_grade',
];
$sortColumn = $columnMap[$sort_by];


// Base JOINs
$joinClauses = "
    INNER JOIN tbl_student s ON e.student_id = s.student_id
    INNER JOIN tbl_section sec ON e.section_id = sec.section_id
";

$whereClause = "WHERE e.is_deleted = 0";
$searchParams = [];
$paramTypes = "";

if ($search !== '') {
    $searchLike = "%$search%";
    $whereClause .= " AND (s.student_name LIKE ? OR sec.section_code LIKE ? OR e.status LIKE ? OR e.letter_grade LIKE ?)";
    $searchParams = [$searchLike, $searchLike, $searchLike, $searchLike];
    $paramTypes = "ssss";
}

$countSql = "
    SELECT COUNT(*) as total 
    FROM tbl_enrollment e
    $joinClauses
    $whereClause
";
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
    SELECT 
        e.enrollment_id, 
        s.student_name,  /* <-- New field: student name */
        sec.section_code, /* <-- New field: section code */
        e.date_enrolled, 
        e.status, 
        e.letter_grade
    FROM 
        tbl_enrollment e
    $joinClauses
    $whereClause
    ORDER BY $sortColumn $order
    LIMIT ? OFFSET ?
";

$enrollments = [];
$finalParams = array_merge($searchParams, [$limit, $offset]);
$finalTypes = $paramTypes . "ii";


$stmtData = $conn->prepare($dataSql);
if (count($finalParams) !== strlen($finalTypes)) {
}
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