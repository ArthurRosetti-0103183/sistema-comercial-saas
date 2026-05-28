from flask import Blueprint, render_template, request, make_response
from flask_login import login_required
from models.venda import Venda
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import io

relatorios_bp = Blueprint('relatorios', __name__)

@relatorios_bp.route('/')
@login_required
def index():
    return render_template('relatorios/index.html')

@relatorios_bp.route('/vendas_pdf', methods=['POST'])
@login_required
def vendas_pdf():
    data_inicio = request.form.get('data_inicio')
    data_fim = request.form.get('data_fim')
    
    query = Venda.query
    if data_inicio:
        dt_ini = datetime.strptime(data_inicio, '%Y-%m-%d')
        query = query.filter(Venda.criado_em >= dt_ini)
    if data_fim:
        dt_fim = datetime.strptime(data_fim, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
        query = query.filter(Venda.criado_em <= dt_fim)
        
    vendas = query.all()
    
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(200, 800, "Relatorio de Vendas")
    
    p.setFont("Helvetica", 10)
    p.drawString(50, 780, f"Periodo: {data_inicio or 'Sempre'} a {data_fim or 'Hoje'}")
    
    y = 750
    p.setFont("Helvetica-Bold", 10)
    p.drawString(50, y, "ID")
    p.drawString(100, y, "Data")
    p.drawString(200, y, "Cliente")
    p.drawString(350, y, "Vendedor")
    p.drawString(450, y, "Total (R$)")
    
    p.setFont("Helvetica", 10)
    total_geral = 0
    for v in vendas:
        y -= 20
        if y < 50:
            p.showPage()
            y = 800
        
        p.drawString(50, y, f"#{v.id}")
        p.drawString(100, y, v.criado_em.strftime('%d/%m/%Y'))
        p.drawString(200, y, v.cliente.nome if v.cliente else "Cons. Final")
        p.drawString(350, y, v.vendedor.nome)
        p.drawString(450, y, f"{v.total:.2f}")
        total_geral += v.total
        
    y -= 30
    p.setFont("Helvetica-Bold", 12)
    p.drawString(350, y, "Total Arrecadado:")
    p.drawString(450, y, f"R$ {total_geral:.2f}")

    p.showPage()
    p.save()
    
    buffer.seek(0)
    response = make_response(buffer.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'inline; filename=relatorio_vendas.pdf'
    return response
