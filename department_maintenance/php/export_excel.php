<?php
include '../../db.php';
header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=departments.xls");

echo "ID\tDepartment Code\tDepartment Name\n";

$result = $conn->query("SELECT * FROM tbl_department ORDER BY dept_id ASC");
while($row = $result->fetch_assoc()){
    echo $row['dept_id'] . "\t" . $row['dept_code'] . "\t" . $row['dept_name'] . "\n";
}
?>
