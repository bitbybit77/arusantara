<?php

use App\Education\EducationArticleStatus;
use App\Models\Education\EducationArticle;
use Illuminate\Support\Facades\Schema;

test('education articles provide stable contextual content records', function () {
    expect(Schema::hasColumns('education_articles', [
        'id', 'author_user_id', 'title', 'slug', 'category', 'summary', 'content', 'status', 'published_at',
    ]))->toBeTrue()
        ->and(Schema::hasIndex('education_articles', ['slug'], 'unique'))->toBeTrue()
        ->and(Schema::hasIndex('education_articles', ['status', 'published_at']))->toBeTrue();

    $article = EducationArticle::factory()->published()->create();

    expect($article->status)->toBe(EducationArticleStatus::Published)
        ->and($article->published_at)->not->toBeNull()
        ->and($article->author)->not->toBeNull();

    $this->assertModelExists($article);
});

test('published education articles require a publication timestamp', function () {
    expect(fn () => EducationArticle::factory()->create([
        'status' => EducationArticleStatus::Published,
        'published_at' => null,
    ]))->toThrow(LogicException::class);
});

test('published education article slugs remain stable for engineering references', function () {
    $article = EducationArticle::factory()->published()->create();

    expect(fn () => $article->update(['slug' => 'changed-reference']))
        ->toThrow(LogicException::class);
});

test('education article slugs remain immutable after publication or archiving', function () {
    $publishedArticle = EducationArticle::factory()->published()->create();
    $publishedArticle->update(['status' => EducationArticleStatus::Draft]);

    $archivedArticle = EducationArticle::factory()->create([
        'status' => EducationArticleStatus::Archived,
    ]);

    expect(fn () => $publishedArticle->update(['slug' => 'changed-after-publication']))
        ->toThrow(LogicException::class)
        ->and(fn () => $archivedArticle->update(['slug' => 'changed-after-archiving']))
        ->toThrow(LogicException::class);
});
