<?php
$current_page = basename($_SERVER['PHP_PATH_INFO'] ?? $_SERVER['PHP_SELF']);
$user_role = $_SESSION['role'] ?? 'student'; 
?>
<div class="sidebar">
	<div class="sidebar-header">
			<h3>PUP Maintenance</h3>
	</div>
	
	<nav class="sidebar-nav">
		<ul>
			<li class="<?php echo ($current_page == 'dashboard.php') ? 'active' : ''; ?>">
					<a href="/dashboard/MaintenanceModule/dashboard.php">Dashboard</a>
			</li>
				<?php if ($user_role === 'super_admin' || $user_role === 'faculty'): ?>
				<li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'department_maintenance') !== false) ? 'active' : ''; ?>">
						<a href="/dashboard/MaintenanceModule/department_maintenance/index.php">Department</a>
				</li>
				<li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'term_maintenance') !== false) ? 'active' : ''; ?>">
						<a href="/dashboard/MaintenanceModule/term_maintenance/index.php">Term</a>
				</li>
				<li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'room_maintenance') !== false) ? 'active' : ''; ?>">
						<a href="/dashboard/MaintenanceModule/room_maintenance/index.php">Room</a>
				</li>
				<li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'program_maintenance') !== false) ? 'active' : ''; ?>">
						<a href="/dashboard/MaintenanceModule/program_maintenance/index.php">Program</a>
				</li>
				<li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'instructor_maintenance') !== false) ? 'active' : ''; ?>">
						<a href="/dashboard/MaintenanceModule/instructor_maintenance/index.php">Instructor</a>
				</li>
				<li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'course_maintenance') !== false) ? 'active' : ''; ?>">
						<a href="/dashboard/MaintenanceModule/course_maintenance/index.php">Course</a>
				</li>
				<li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'course_prerequisite_maintenance') !== false) ? 'active' : ''; ?>">
						<a href="/dashboard/MaintenanceModule/course_prerequisite_maintenance/index.php">Course Prerequisite</a>
				</li>
				<li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'student_maintenance') !== false) ? 'active' : ''; ?>">
						<a href="/dashboard/MaintenanceModule/student_maintenance/index.php">Student</a>
				</li>
				<li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'section_maintenance') !== false) ? 'active' : ''; ?>">
						<a href="/dashboard/MaintenanceModule/section_maintenance/index.php">Section</a>
				</li>
			<?php endif; ?>

			<?php if ($user_role === 'student' || $user_role === 'super_admin' || $user_role === 'faculty'): ?>
				<li class="<?php echo (strpos($_SERVER['PHP_SELF'], 'enrollment_maintenance') !== false) ? 'active' : ''; ?>">
						<a href="/dashboard/MaintenanceModule/enrollment_maintenance/index.php">
								<?php echo ($user_role === 'student') ? 'My Enrollment' : 'Enrollment'; ?>
						</a>
				</li>
			<?php endif; ?>
		</ul>
	</nav>

	<div class="sidebar-footer">
		<a href="/dashboard/MaintenanceModule/login/php/logout.php" class="logout-link">Logout</a>
	</div>
</div>