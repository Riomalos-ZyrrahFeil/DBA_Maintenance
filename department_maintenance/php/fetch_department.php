<?php
header("Content-Type: application/json");
include '../../db.php';

// Fetch all departments
$sql = "SELECT dept_id, dept_name FROM tbl_department ORDER BY dept_name ASC";
$result = $conn->query($sql);

$departments = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $departments[] = $row;
    }
}

echo json_encode($departments);
$conn->close();
?>
