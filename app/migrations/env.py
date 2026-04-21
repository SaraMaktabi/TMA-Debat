import sys
from pathlib import Path

# Ajouter le dossier parent (app/) au chemin Python
sys.path.insert(0, str(Path(__file__).parent.parent))

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# Importer les modèles
from database import Base
from core.config import config as app_config
from models.ticket import Ticket
from models.technicien import Technicien
from models.debat_temp import DebatTemp

# Alembic config
config = context.config

# Configurer le logging
if config.config_file_name:
    fileConfig(config.config_file_name)

# URL de la base (depuis .env)
config.set_main_option("sqlalchemy.url", app_config.DATABASE_URL)

# Metadata
target_metadata = Base.metadata

def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
