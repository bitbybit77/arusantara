<?php

namespace App\Education;

enum EducationArticleStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';
}
