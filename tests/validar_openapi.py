"""Validação formal opcional: pip install openapi-spec-validator==0.9.0."""
import json
from pathlib import Path
from openapi_spec_validator import validate_spec
from openapi_schema_validator import OAS30Validator

root = Path(__file__).resolve().parents[1]
spec = json.loads((root / 'contratos/openapi.json').read_text())
examples = json.loads((root / 'exemplos/consultas.json').read_text())
validate_spec(spec)

def validator(name):
    return OAS30Validator({'$ref': '#/components/schemas/' + name, 'components': spec['components']})

for case in examples['casos']:
    validator('Selecao').validate(case['entrada'])
response = spec['paths']['/resultados']['post']['responses']['200']['content']['application/json']['example']
validator('Resultados').validate(response)
invalid = dict(examples['casos'][0]['entrada'], recorte_ids=[])
assert not validator('Selecao').is_valid(invalid), 'Seleção vazia não pode consultar toda a bacia.'
invalid = {'sg_variavel': 'CAR', 'situacao': 'indisponivel', 'quantidade': 4, 'pendencias': [{'id_recorte': 'TI_002', 'motivo': 'Pendente'}]}
assert not validator('Indisponivel').is_valid(invalid), 'Indisponibilidade não pode publicar total parcial.'
print('OpenAPI válido; seis entradas e resposta válidas; seleção vazia e total parcial rejeitados.')
