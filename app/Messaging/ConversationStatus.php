<?php

namespace App\Messaging;

enum ConversationStatus: string
{
    case Active = 'active';
    case Closed = 'closed';
}
