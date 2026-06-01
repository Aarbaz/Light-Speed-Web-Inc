<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Default application routes
$route['default_controller'] = 'welcome';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

// Contacts API routes
$route['contacts'] = 'contactcontroller/index';
$route['contacts/(:num)'] = 'contactcontroller/show/$1';
$route['contacts/create'] = 'contactcontroller/store';
$route['contacts/(:num)/update'] = 'contactcontroller/update/$1';
$route['contacts/(:num)/delete'] = 'contactcontroller/destroy/$1';
$route['store'] = 'contactcontroller/store';
