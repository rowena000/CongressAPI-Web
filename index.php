<?php
	$congressdb = $_GET["congressdb"];
	// $chamber = $_GET["chamber"];
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	
	switch ($congressdb) {
		case "legislators":
			$output = processLegislators($congressdb, $_GET);
			break;
		case "bills":
			$output = processBills($congressdb, $_GET);
			break;
		case "committees":
			$output = processCommittees($congressdb, $_GET);
			break;
		default:
			$output = "{}";
	} 
	
	
	echo json_encode($output);
	
	
	function processLegislators($congressdb, $request) {
		$url = getBaseUrl() .$congressdb ."?" .getKey() ."&per_page=all";
		if ($request['chamber'] != null) {
			$url .= "&chamber=" . $request['chamber'];
		}
		
		if ($request['bioguide_id'] != null) {
			$url .= "&bioguide_id=" .$request['bioguide_id'];
		}
		
		// echo $url;
		// echo $request["congressdb"];
		
		$response = @file_get_contents($url);
		if (!$response) {
			$error = error_get_last();
	        echo "HTTP request failed. Please verify your input or retry";
			return;
		}
		
		$response = json_decode($response);
		return $response;
	}
	
	function processBills($congressdb, $request) {
		$url = getBaseUrl() .$congressdb ."?" .getKey();
		
		// echo $request["congressdb"];
		if ($request['sponsor_id'] != null) {
			$url .= "&sponsor_id=" .$request['sponsor_id'] . "&per_page=5";
		} else if ($request['active'] != null) {
			$url .= "&history.active=" .$request['active'] ."&per_page=50";
		} else if ($request['bill_id'] != null) {
			$url .= "&bill_id=" .$request['bill_id'];
		} else {
			$url .= "&per_page=50";
		}
		// echo $url;
		
		$response = @file_get_contents($url);
		if (!$response) {
			$error = error_get_last();
	        echo "HTTP request failed. Please verify your input or retry";
			return;
		}
		
		$response = json_decode($response);
		return $response;
	}
	
	
	function processCommittees($congressdb, $request) {
		$url = getBaseUrl() .$congressdb ."?" .getKey();
		
		if ($request['member_id'] != null) {
			$url .= "&member_ids=" .$request['member_id'] ."&per_page=5";
		} else if ($request['chamber'] != null) {
			$url .= "&chamber=" .$request['chamber'] ."&per_page=all";
		} else {
			$url .= "&per_page=all";
		}
		// echo $url;
		
		$response = @file_get_contents($url);
		if (!$response) {
			$error = error_get_last();
	        echo "HTTP request failed. Please verify your input or retry";
			return;
		}
		
		$response = json_decode($response);
		return $response;
	}
	
	function getBaseUrl() {
		return "http://congress.api.sunlightfoundation.com/";
	}
	
	function getKey() {
		return "apikey=ea055b890b9b46f5ac8d06339ed6fa9e";
	}
 ?>