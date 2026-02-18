INSERT INTO authors (name, email, password_hash, bio, joined_at) VALUES
('Sarah Chen', 'sarah.chen@guardian2.com', '$2b$10$xJ8Kq3rZv1mN4wE5tY6uOe', 'Tech reporter covering AI and startups.', '2025-01-15'),
('James Okafor', 'james.okafor@guardian2.com', '$2b$10$aB3cD4eF5gH6iJ7kL8mN9o', 'Political correspondent based in London.', '2026-03-22'),
('Priya Sharma', 'priya.sharma@guardian2.com', '$2b$10$pQ1rS2tU3vW4xY5zA6bC7d', 'Science and environment editor.', '2025-11-08'),
('Tom Reeves', 'tom.reeves@guardian2.com', '$2b$10$eF8gH9iJ0kL1mN2oP3qR4s', 'Sports journalist and podcast host.', '2025-02-14'),
('Amira Hassan', 'amira.hassan@guardian2.com', '$2b$10$tU5vW6xY7zA8bC9dE0fG1h', 'Culture and arts critic.', '2025-07-30');

INSERT INTO posts (author_id, title, summary, body, published_at) VALUES
(1, 'The Rise of Open Source AI Models', 'How open-weight models are reshaping the AI landscape.', 'The past year has seen a dramatic shift in the AI industry. Companies that once guarded their models behind closed APIs are now releasing weights openly. Meta''s LLaMA series kicked off a wave of open releases that has fundamentally changed how researchers and startups build products. The implications for competition and innovation are enormous.', '2024-06-12'),
(1, 'Why Your Next Developer Might Be an AI Agent', 'Coding assistants are getting scarily good.', 'Software engineering is being transformed by AI coding tools. What started as autocomplete suggestions has evolved into agents that can plan, write, and debug entire features. Senior engineers report spending more time reviewing AI-generated code than writing their own. The question isn''t whether this changes the profession — it''s how fast.', '2024-09-03'),
(1, 'London''s Tech Scene After Brexit', 'The capital adapts to new realities.', 'Five years on from Brexit, London''s tech ecosystem looks different but far from diminished. Visa reforms have attracted talent from outside the EU, and several major funding rounds suggest investor confidence remains strong. But challenges around regulation and data flows persist.', '2024-01-20'),
(2, 'Election Night: What the Polls Got Wrong', 'Another election, another polling miss.', 'For the third cycle running, pre-election surveys significantly underestimated support for the opposition. Pollsters point to differential non-response and late-deciding voters, but critics argue the industry needs a fundamental rethink. We spoke to five leading statisticians about what went wrong.', '2024-07-05'),
(2, 'Inside the New Climate Bill', 'A breakdown of the legislation that could reshape energy policy.', 'After months of negotiations, the government has unveiled its flagship climate legislation. The bill sets ambitious targets for renewable energy adoption and introduces carbon pricing mechanisms that will affect every sector of the economy. Environmental groups are cautiously optimistic, while industry leaders warn about implementation costs.', '2024-11-18'),
(3, 'The Ocean Cleanup Problem Nobody Talks About', 'Microplastics are the real crisis beneath the surface.', 'While dramatic images of plastic islands grab headlines, scientists say the real threat is invisible. Microplastics have been found in human blood, breast milk, and deep ocean sediments. Current cleanup technologies can''t address particles this small, and production continues to rise. We spoke to marine biologists about what actually needs to change.', '2024-04-09'),
(3, 'CRISPR Babies: Five Years Later', 'Where the gene-editing debate stands now.', 'It has been five years since He Jiankui shocked the world by editing the genes of twin embryos. The scientific community''s response was swift condemnation, but the technology has only advanced. New trials for genetic diseases are underway in multiple countries, raising fresh questions about where to draw the line.', '2024-08-22'),
(3, 'Why Fusion Energy Is Closer Than You Think', 'Recent breakthroughs suggest commercial fusion may arrive this decade.', 'Multiple private fusion companies have achieved milestones that were considered decades away. Net energy gain has been demonstrated, and the engineering challenges of building a commercial reactor are being tackled with unprecedented funding. The race is on between at least six serious contenders.', '2025-01-10'),
(3, 'The Antibiotic Resistance Crisis', 'Drug-resistant infections are rising faster than new treatments.', 'The WHO has declared antimicrobial resistance one of the top ten global health threats. Common infections that were easily treatable a decade ago are becoming deadly again. The pipeline for new antibiotics is thin, partly because developing them is not profitable enough for pharmaceutical companies.', '2024-03-15'),
(3, 'Mars Sample Return: The Most Ambitious Mission Ever', 'NASA and ESA plan to bring Martian rock to Earth.', 'The Mars Sample Return mission represents the most complex robotic space mission ever attempted. Multiple spacecraft, a rocket launch from another planet, and an orbital rendezvous millions of kilometres from Earth. If it works, scientists will have pristine Martian material to study for decades.', '2024-12-01'),
(4, 'The Premier League''s Financial Fair Play Problem', 'How spending rules are reshaping English football.', 'Financial fair play regulations were supposed to level the playing field. Instead, clubs have found creative ways around the rules while smaller teams struggle to compete. Recent charges against top clubs have thrown the entire system into question. We examine what comes next for the most watched football league in the world.', '2024-05-28'),
(5, 'Street Art Goes Corporate', 'When murals become marketing, who really benefits?', 'Major brands are commissioning street artists to paint murals in trendy neighbourhoods, blurring the line between art and advertising. Some artists see it as validation and a steady income. Others argue it undermines the rebellious spirit that made the form meaningful in the first place.', '2024-10-14'),
(5, 'The Streaming Wars Are Over. Nobody Won.', 'Fragmentation has left viewers frustrated and studios bleeding money.', 'Every major media company launched a streaming service, and now most are losing money. Consumers face subscription fatigue, content is spread across too many platforms, and the promise of cord-cutting convenience has given way to a more expensive and confusing landscape than cable ever was.', '2024-02-07'),
(5, 'Why Live Theatre Is Having a Moment', 'Post-pandemic audiences are flocking back to stages across the country.', 'Theatre attendance has surged past pre-pandemic levels in several major cities. Industry figures credit a combination of pent-up demand for shared live experiences and a new generation of playwrights tackling themes that resonate with younger audiences. But rising production costs threaten to put tickets out of reach for many.', '2025-01-25');

INSERT INTO tags (name) VALUES
('Technology'),
('Politics'),
('Science'),
('Sport'),
('Culture'),
('Environment'),
('Business');

INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1),
(1, 7),
(2, 1),
(3, 1),
(3, 7),
(3, 2),
(4, 2),
(5, 2),
(5, 6),
(6, 3),
(6, 6),
(7, 3),
(8, 3),
(8, 1),
(9, 3),
(10, 3),
(10, 1),
(11, 4),
(11, 7),
(12, 5),
(13, 5),
(13, 1),
(14, 5);