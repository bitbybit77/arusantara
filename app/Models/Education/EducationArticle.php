<?php

namespace App\Models\Education;

use App\Education\EducationArticleStatus;
use App\Models\User;
use Database\Factories\Education\EducationArticleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use LogicException;

/**
 * @property int $id
 * @property int|null $author_user_id
 * @property string $title
 * @property string $slug
 * @property string $category
 * @property string|null $summary
 * @property string $content
 * @property EducationArticleStatus $status
 * @property Carbon|null $published_at
 */
#[Fillable(['author_user_id', 'title', 'slug', 'category', 'summary', 'content', 'status', 'published_at'])]
class EducationArticle extends Model
{
    /** @use HasFactory<EducationArticleFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_user_id');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => EducationArticleStatus::class,
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (EducationArticle $article): void {
            if ($article->status === EducationArticleStatus::Published && $article->published_at === null) {
                throw new LogicException('A published education article must have a publication timestamp.');
            }

            if ($article->exists && $article->isDirty('slug') && $article->wasEverPublishedOrArchived()) {
                throw new LogicException('The slug of a published or archived education article is immutable.');
            }
        });
    }

    private function wasEverPublishedOrArchived(): bool
    {
        return $this->getRawOriginal('published_at') !== null
            || in_array($this->getRawOriginal('status'), [
                EducationArticleStatus::Published->value,
                EducationArticleStatus::Archived->value,
            ], true);
    }
}
