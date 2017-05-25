#!/usr/bin/env python

import argparse
from flask import Flask, render_template

import app_config
import json
import oauth
import static

from render_utils import make_context, urlencode_filter
from werkzeug.debug import DebuggedApplication
from oauth import oauth_required

app = Flask(__name__)
app.debug = app_config.DEBUG

app.jinja_env.filters['urlencode'] = urlencode_filter

# Example application views
@app.route('/')
@oauth.oauth_required
def index():
    """
    Example view demonstrating rendering a simple HTML page.
    """

    return render_template('index.html', **make_context())

@app.route('/hall/<string:slug>/')
def _detail(slug):

    context = make_context()

    context['dorm'] = []
    context['images'] = []
    context['quotes'] = []
    context['nonres_quotes'] = []
    context['slug'] = ''

    dorms = list(context['COPY']['dorms'])
    images = list(context['COPY']['images'])
    quotes = list(context['COPY']['quotes'])
    nonres_quotes = list(context['COPY']['nonres_quotes'])
    dorm_name = ''

    for dorm in dorms:
        dorm = dict(zip(dorm.__dict__['_columns'], dorm.__dict__['_row']))
        dorm_slug = dorm.get('slug')

        if dorm_slug == slug:
            context['dorm'] = dorm
            context['slug'] = str(slug)
            dorm_name = dorm.get('name')

    for image in images:
        image = dict(zip(image.__dict__['_columns'], image.__dict__['_row']))
        image_dorm = image.get('dorm')

        if image_dorm == dorm_name:
            context['images'].append(image)

    for quote in quotes:
        quote = dict(zip(quote.__dict__['_columns'], quote.__dict__['_row']))
        quote_dorm = quote.get('dorm')

        if quote_dorm == dorm_name:
            context['quotes'].append(quote)

    for quote in nonres_quotes:
        quote = dict(zip(quote.__dict__['_columns'], quote.__dict__['_row']))
        quote_dorm = quote.get('dorm')

        if quote_dorm == dorm_name:
            context['nonres_quotes'].append(quote)

    return render_template('detail.html', **context)


app.register_blueprint(static.static)
app.register_blueprint(oauth.oauth)


# Enable Werkzeug debug pages
if app_config.DEBUG:
    wsgi_app = DebuggedApplication(app, evalex=False)
else:
    wsgi_app = DebuggedApplication(app, evalex=False)


if __name__ == '__main__':
    print 'This command has been removed! Please run "fab app" instead!'
