-- Estado offline / fuera de oficina (OOF) en el semáforo de Sergio

ALTER TYPE sergio_capacity ADD VALUE IF NOT EXISTS 'oof';
