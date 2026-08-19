<?php

namespace App\Identity;

enum UserRole: string
{
    case Customer = 'customer';
    case Maker = 'maker';
    case Admin = 'admin';
}
