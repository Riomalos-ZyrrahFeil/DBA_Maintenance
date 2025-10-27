<?php
include '../../db.php';
header('Content-Type: application/json');

// Get parameters safely
$search = $_GET['search'] ?? '';
$sort_by = $_GET['sort_by'] ?? 'course_id';
$order = isset($_GET['order']) && strtolower($_GET['order']) === 'asc' ? 'ASC' : 'DESC';
$page = isset($_GET['page']) ?? 1;
$limit = $_GET['limit'] ?? 10;
$offset = (intval($page) - 1) * intval($limit);

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

$valid_columns = ['course_id', 'course_code', 'title', 'lecture_hours', 'lab_hours', 'units'];
if (!in_array($sort_by, $valid_columns)) {
    $sort_by = 'course_id';
}

// =========================================================
// 1. FETCH SINGLE COURSE (For Edit Forms - Highest Priority)
// =========================================================
if ($id > 0) {
    $stmt = $conn->prepare("
        SELECT * FROM tbl_course 
        WHERE course_id = ? 
          AND is_deleted = 0
        LIMIT 1
    ");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $course = $result->fetch_assoc();

    echo json_encode($course ?: []);
    $stmt->close();
    exit;
}


// =========================================================
// 2. QUICK FETCH (For dropdowns/Prerequisite Module)
//    This block executes when 'page' AND 'limit' are NOT provided.
// =========================================================
if (!isset($_GET['page']) && !isset($_GET['limit'])) {
    $sql_basic = "SELECT course_id, course_code, title FROM tbl_course WHERE is_deleted = 0 ORDER BY course_code ASC";
    
    $result_basic = $conn->query($sql_basic);
    $courses_basic = [];
    while ($row = $result_basic->fetch_assoc()) {
        $courses_basic[] = $row;
    }
    
    // Returns a simple array of course objects, suitable for JavaScript dropdown population.
    echo json_encode($courses_basic);
    exit; // STOP SCRIPT HERE
}


// =========================================================
// 3. PAGINATED FETCH (For Course Maintenance Table)
// =========================================================
// Sanitize search term
$safe_search = $conn->real_escape_string($search); 

$whereClause = "WHERE is_deleted = 0 AND (course_code LIKE ? OR title LIKE ?)";
$searchParam = "%{$safe_search}%";
$searchParams = [$searchParam, $searchParam];
$paramTypes = "ss";

// Count Query
$countSql = "SELECT COUNT(*) as total FROM tbl_course $whereClause";
$totalRecords = 0;

$stmtCount = $conn->prepare($countSql);
$stmtCount->bind_param($paramTypes, ...$searchParams);
$stmtCount->execute();
$resultCount = $stmtCount->get_result();
$totalRecords = $resultCount->fetch_assoc()['total'];
$stmtCount->close();

// Data Query
$dataSql = "
    SELECT * FROM tbl_course 
    $whereClause
    ORDER BY $sort_by $order
    LIMIT ? OFFSET ?
";

$courses = [];
// Ensure $limit and $offset are integers for binding
$finalLimit = intval($limit);
$finalOffset = intval($offset);

$finalParams = array_merge($searchParams, [$finalLimit, $finalOffset]);
$finalTypes = $paramTypes . "ii";

$stmtData = $conn->prepare($dataSql);
$stmtData->bind_param($finalTypes, ...$finalParams);
$stmtData->execute();
$resultData = $stmtData->get_result();

while ($row = $resultData->fetch_assoc()) {
    $courses[] = $row;
}
$stmtData->close();

echo json_encode([
    'data' => $courses,
    'total_records' => $totalRecords
]);
// Note: $conn->close() is typically done by the included 'db.php' or when the script exits.
?>