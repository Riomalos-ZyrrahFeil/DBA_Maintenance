<?php
include '../../db.php';

header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=instructors.xls");

echo "Instructor ID\tFull Name\tEmail\tDepartment\n";

$sql = "SELECT i.instructor_id, CONCAT(i.first_name,' ',i.last_name) as full_name, i.email, d.dept_name 
        FROM tbl_instructor i 
        LEFT JOIN tbl_department d ON i.dept_id = d.dept_id";
$res = $conn->query($sql);

while($row = $res->fetch_assoc()){
    echo $row['instructor_id'] . "\t" . $row['full_name'] . "\t" . $row['email'] . "\t" . $row['dept_name'] . "\n";
}
?>
