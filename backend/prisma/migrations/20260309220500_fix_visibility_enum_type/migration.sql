DO $$
BEGIN
  CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'PRIVATE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Event"
ALTER COLUMN "visibility" DROP DEFAULT;

ALTER TABLE "Event"
ALTER COLUMN "visibility" TYPE "EventVisibility"
USING ("visibility"::"EventVisibility");

ALTER TABLE "Event"
ALTER COLUMN "visibility" SET DEFAULT 'PUBLIC';
