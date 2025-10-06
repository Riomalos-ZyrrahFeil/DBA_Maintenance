<?php
include '../../db.php';
$result = $conn->query("SELECT * FROM tbl_department ORDER BY dept_id ASC");

$html = "<h2>Department List</h2>";
$html .= "<table border='1' cellpadding='5' cellspacing='0'>";
$html .= "<tr><th>ID</th><th>Department Code</th><th>Department Name</th></tr>";

while($row = $result->fetch_assoc()){
    $html .= "<tr>
        <td>{$row['dept_id']}</td>
        <td>{$row['dept_code']}</td>
        <td>{$row['dept_name']}</td>
    </tr>";
}
$html .= "</table>";

echo $html;
?>
