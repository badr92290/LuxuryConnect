-- Les demandes enregistrées sous l'ancienne valeur « PPF » deviennent
-- « PPF brillant », la finition par défaut d'un film de protection.
-- Une valeur d'énumération ne peut pas être utilisée dans la migration qui
-- l'ajoute : d'où cette seconde migration.
UPDATE "QuoteRequest" SET "serviceType" = 'PPF_GLOSS' WHERE "serviceType" = 'PPF';
UPDATE "ProfessionalService" SET "serviceType" = 'PPF_GLOSS' WHERE "serviceType" = 'PPF';
UPDATE "ContactLead" SET "serviceType" = 'PPF_GLOSS' WHERE "serviceType" = 'PPF';
