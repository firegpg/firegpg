/*

***** BEGIN LICENSE BLOCK *****

Version: MPL 1.1/GPL 2.0/LGPL 2.1

The contents of this source code are subject to the Mozilla Public License
Version 1.1 (the "License"); you may not use this source code except in
compliance with the License. You may obtain a copy of the License at
http://www.mozilla.org/MPL/

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the
License.

The Original Code is the FireGPG extension.

The Initial Developer of the Original Code is Maximilien Cuony.

Portions created by the Initial Developer are Copyright (C) 2007
the Initial Developer. All Rights Reserved.

Contributor(s):

Alternatively, the contents of this source code may be used under the terms of
either the GNU General Public License Version 2 or later (the "GPL"), or
the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
in which case the provisions of the GPL or the LGPL are applicable instead
of those above. If you wish to allow use of your version of this source code
only under the terms of either the GPL or the LGPL, and not to allow others to
use your version of this source code under the terms of the MPL, indicate your
decision by deleting the provisions above and replace them with the notice
and other provisions required by the GPL or the LGPL. If you do not delete
the provisions above, a recipient may use your version of this source code
under the terms of any one of the MPL, the GPL or the LGPL.

***** END LICENSE BLOCK *****

*/

if (typeof(FireGPG)=='undefined') { FireGPG = {}; }
if (typeof(FireGPG.Const)=='undefined') { FireGPG.Const = {}; }

FireGPG.Const.Gmail2 = {} ;

/* Constant: GMAIL_MAIN_DOC_URL
 The url of the mail document for gmail */
FireGPG.Const.Gmail2.GMAIL_MAIN_DOC_URL = "http://mail.google.com/mail/?ui=2&view=bsp&ver=";
/* Constant: GMAIL_MAIN_DOC_URL2
 The url of the mail document for gmail and https. */
FireGPG.Const.Gmail2.GMAIL_MAIN_DOC_URL2 = "https://mail.google.com/mail/?ui=2&view=bsp&ver=";


//Pictures
FireGPG.Const.Gmail2.IMG_SIGN_ON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALlwAAC5cB2lSXmQAAAAd0SU1FB9kHGgoSMVDceZMAAAIySURBVDjLjZPLS9RRGIafMzNZaolZDaHOoET2B0x0YSSoVdFAi1rUKqhVLYSCKGkT4a5NpIuCLuoqWpSRrUoLTQvJSzUkXkDNBE0w1Ln95nfO+VrMKJNOlw8+DhzO+37Pd+D18oeKhLly7Zz/hdHxopogg6PTOPxvRcJc+NkbEvm8T+yXg9JxryoVCVMfCVO89q03j/hM8639D8pKNyo8HpSC6spi3+njlUe2FHIpFltK1QQZGJ3GAKg14mN3G/a2V1SUeAAQAWuyrcEanJTm1OWhuvYeGgF8uQaHD2y/UxHc5gEFYkFM5lwpAa9XASysXHlyDWpDO4IUFIJvAygF1mZabIYGYWomJsDrFY0vB79op39TAUaD0aDTYNzf8LGW5raZ8fYe5tYZAIGSQgVOPDtZZ9roDIE1WCsyNJpoy6XOXSFQ4NGQTiBOXG7c/gSuAyZLYrS86p4zwONcg1yCoNemwbGMjC+p+rPloFNgLSIiD5/PJZ91LR192csEUA1MrFvBo1NY8ci7wQW1J+AXXFHaNdLQMjv75E36/PAkpcAhYCTvHyjt0D+cVCdri1Guo2IJbesa5yeedtvGxRiB7NQR4Mc6A6UIuskEnQNJQrsUkzMpLjYtRjs/0uK4TAFjwDdgOe8fVG5VVR39CU6EvHQNJbje6rz9EOW+FYaz4uV8uVk1cAzlHVHN93kjjzpta99XmoBhIP634K2GyV/G5niS3X1jcvV9lJvANOD+K7m/ALzCEdEPOm1AAAAAAElFTkSuQmCC";
FireGPG.Const.Gmail2.IMG_SIGN_OFF = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAXNSR0IArs4c6QAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAAuXAAALlwHaVJeZAAAAB3RJTUUH2QcaCjARzAAfewAAAUtJREFUKM9dzk8rBHEcx/H3b2etuLBDXGw5CEUph01bysHmwAPghKODR+G2JzyCfQKKcnGQtLKlNpL82RLthLWmPeyitTPz+zqMHcPn+Pu8+vy+BqGk5lbXnViiZLm/b0aonsksTsQWRnrSVUmULO8fSCUzy90qgmIgMj/aka47iZKlA5Aa31jrVxEUoEANGrNjB3XrAaI+mFoaUACCIK3pD4CIDybNNqKADsiTcAM/C6lYX1Tj4aHRaATN7ttpLQCYHTSRUK2leO5v+1/EDRyasoXr78iJcOYDf6FHaHKvVvDQiOw5x5t5m17sFoi7iJyrhDjKlWztKPvYyTDl0A0et2oaV33Ktp07fDexKVMPgDIbFBjima2nwqlT5ZUqjdANZm+BJBdk765y8kKlVQbA67qkIof56yNe+OJPDIB4e6OvuHO1TxWPf/kGAVuOI6EGAwgAAAAASUVORK5CYII%3D";

FireGPG.Const.Gmail2.IMG_ENCRYPT_ON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAQCAYAAADJViUEAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALAAAACwAB5DetvwAAAAd0SU1FB9kHGgoVEr36niYAAAJSSURBVCjPjZPPS5RBGMc/M/PuD81lVWyTUtDQk4IQFBkY1EWok1AXb12koHMZhkh06GAI/gGd61J07LClkCGBQiYZlIVpadar7tq7++77zrvT4X1117z0wJeZgfl8n2e+MIJ/anh4rFFKORaLWf11dbXtvq/XPE+/Au6MjQ1vVt8V1YeRkXsXlBLPentP097elhZCEARl1tfXCwsLH5zdXef66Ojtp4fgu3fvH9e6tDQ4eLU2mUxaWmtyuXwghKC+Pq1ct2Sy2Wnbcdzzo6O3lgCsPXh7e+vBwMClWDKZVLa9FWSzL1cWFxc/ZjLHmjo7Ozv6+s6lenq6G6amXo8Dlw/AUnKxubm5RmvNzMzs74mJhyO2bb8FMkNDNyZTqSMdXV1dDYlE/Mw+s7dpaKhvklJRKBTN8vLnFdu2nwBfgNmdnZ3Z1dUffhAEvpQqfQgWQkgwlEqeSSSSAKZi3FjWWivP88q+r9WBwNbHk5/iVqxDKYkBykFgFIEf3RAGoRBCCikxpowvgrXMTbfVAtCBdfLo2RKoaBaFQBMvOyBromRikRLw83n8xP7YjpYo36A8E66+4dHjgN5rPvMvyijLoOIGVWtQdQZHy8qbHU9Bjory8OadYe6bYWnFQAHwAB8og+OrClzwFOSpKAf93aF7V4uAEqH24FIV7LgKHOBPpF14vxyGvfbLgBt11hFcDGErggVulL0ILdvSMHlF0poWIZwAggh2ldiHi65k7nvKVH+SUy2hkZEwNw/CQmCFRKEgK52/buami26smf+sjXxuA+AvRn8EP+5R8C8AAAAASUVORK5CYII%3D";
FireGPG.Const.Gmail2.IMG_ENCRYPT_OFF = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAQCAQAAABjX+2PAAAAAXNSR0IArs4c6QAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAAsAAAALAAHkN62/AAAAB3RJTUUH2QcaCjITEDgc1QAAAV1JREFUGNNtkT9LW2EYxX/P8743l9Rak2pCQYJkqmKxs0O/QKGzpY4tDn4BKShd3N36DbqVUhC6CopLKR3iVCFpSgQLaUhKYsz98+Z1uFcnzzMceH4cOHCEXO9n9FWwOrOQ9JNffPkwzL6S2e5T3V6nXhQcl3EjGn3a+wlgAPZK6c5GWC04BtPYV22tcLHyonE0yvHam5eL86bnv/07/N26HhSWzKNCs3L8HSyALD8JUk6HB197bWa3Xs9WVx+EdQAFKD9Uxr7Z6/2gS2vQ6jjntHiHRSAiBA9Q9qnGPtW8+cd9WzWA8+IAQUUUj++/27HgKs9QFBVnJ4QoFkvASQkUElx+n3nLMZaAkCIJYCHmCkUxNGjzhwjBMCXOqkWMGTPmiudAjYSEFE+UpSMiQFGaQJcYQ8CU6wxPiBFAecwmZWICpngmkuOOz4ZZQhDOMGLQ2/Tf88kc92jwH24AgN5+uB4a3EQAAAAASUVORK5CYII%3D";

FireGPG.Const.Gmail2.IMG_INLINE_ON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAMmwAADJsBwcsw5QAAAAd0SU1FB9kHGgo0B1y4by4AAAFBSURBVDjLnZPPSgMxEMa/JJtWL5VFqhtYQYTQ3ixIWXr01qv0JXr0GXwCpQ/Rg+/gC3jYLMiyLYW9FPEPLN1qLkI3XmxB3HTV7zTJZH4zmUkIvjQej8/zPL9DhQghj8aYy+FweAsAztrR6XT2siyrikeapkJrfQPgO6Ddbj/hF2KMEaWUWK83gDAMT6IoQlEUpYGO42AwGPzcXxue571qrbFarUoBtVoN9XrdDhBCvAkh8FdtAEmSeHEcb62g3+/bAYyxgnMOxlgpgHMOQogdIKV8kVL+/wp4Hh1hfgUU2n569xTAtQUwn+5jllekmwK+rYKzkULzAvh4twNcCcyW5YDFYrEzXx7AmKb1IbXcFoD7csBkMjlWSlmTU0rh+769iUEQJN1uF8YY2y8EpXTLFIAHSmmvamyu6x42Go1NIz4B+0Vdfr/juF8AAAAASUVORK5CYII%3D";
FireGPG.Const.Gmail2.IMG_INLINE_OFF = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAXNSR0IArs4c6QAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAAybAAAMmwHByzDlAAAAB3RJTUUH2QcaCjUE3KoP1QAAAL9JREFUKM99z80KAVEYxvH/mQ9CzYSmKJZTdmzkFuxtXIK9i3Apci/K2AgbCyk2mmmampKPDXXeI97Vqff3vE9HAcw7yRRjVPxcTJbgAPRKV3PPwc/GfEAn+dpjq8iHN1gFax7a0mGkvYFGmnHXQIGiBM28ya9xALb+xrgwlMB+uNgacFEShGn4v+JcO4oKKEtwqZy+coEOuseAmwAeex3E7pWnyLdlxa4eibxFS4LBuS8uKCwJOFkz83tVz8sBXnb+KqAqG6pSAAAAAElFTkSuQmCC";

FireGPG.Const.Gmail2.IMG_ATTACHEMENTS_ON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALvwAAC78BbPa+aAAAAAd0SU1FB9kHGgo3A3D4+PQAAAGQSURBVDjLjZE/aFNRFMa/79z78vLPFILPwZYU/8TJQKFQnMVJIriWggUHQVzcXUSXDF0yqKuDiGkpRXAqiKNiFVQwHUIgsQkdIsGkjxA1ec9BoS+5L/jO+Lvf/c53ziFC6mxubUOob47GQ/+YeqLE9uvfnmWDWpn+fOHMreeeN8prnTpstCrFRqtSBLytX797T5VK6mm9AUT0NZIfAI4BvAWAuO08IlWPooy0Yg5ACDXDGEPkBlESA6lATj6RChQdIQEFFCsEWxBGMBBqCBUQSEAKhCrUQJudNEgNCXgLNXx6E6YzExDm/MEUERIIRGIAoAJQCf8uN1KC/lFtR6vUieVCqbpcKL2PWXOnjtz6K0ZaolhIJRfefN5/cOV7d+/Lj3618+nr/avJxOldCbmOOQIIO3bSAfC62d5e/Yf9uO1cJuj/18AdNPcy6fzmylK5HLedhwAw/Nm5B9+723drH82GZqWd7KU7ufnrt5VKuADGo/Egc9B++aTTffcYgIuIVTi3eKNyfnH9BYCLs0R/AFUHYUhQn+mwAAAAAElFTkSuQmCC";
FireGPG.Const.Gmail2.IMG_ATTACHEMENTS_OFF = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALvwAAC78BbPa+aAAAAAd0SU1FB9kHGgo4CRe1DSUAAAF9SURBVDjLjZO9S0JhFMafc45x0fJe+hCSKKRAoqXJRaMMEqJobMlNoqagf6G/IGhuKdrEsSgibi7VELRFRoiBouDU101FfBvkgumN7hkfnvc5v3NeDsGh5ucT6yISazTqytaUAvX1eZDNXu52ej3djxOJtU3L+tJ8vv430zw/AoBodDFqWZ+NQGB0rtvfEyAis8xUYOYWgDwA6LqxIcLfzNxD26MwM4iEOjUiApGQ6wARBhF1kTGYxU2AQOS3kYggIhBxSdDuRL8CmMUdQbuToHMCm8D1DtpG+oPsn2+0jUTEHRorBUcCj9MSK5XSQyg0lUgmt/YAVW82m3qh8HI3ORmecDXC8PBILp0+3s/nc8VS6fUjkzk5GBwcenRJwPD7jQEAT7e32UP7FHTdmHYVUK1WCsHg+HYqtXOl68YpALy/v60opZbK5eJrt58cjlELh2cWI5HYgqZ564Bq1Wrf3vv7m+vn58drAPX/Auwai8eXV4mUMs2LMwAlJ9MP3EBoWAEix+IAAAAASUVORK5CYII%3D";

FireGPG.Const.Gmail2.IMG_ENCRYPTED = FireGPG.Const.Gmail2.IMG_ENCRYPT_ON;
FireGPG.Const.Gmail2.IMG_ENCRYPTED2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB9gFCxQBOXBpjnYAAAIFSURBVDjLzZHPS9NxGMdfn8++Op2hWaNE58LZKRNKI1MLRKZ06NahGYs6dO/SLaiTdFDoj8hDh04FefDHpLnAQ1oYUWFB6tRDsFmXre8+z9NhMqZ2rwceHngenhfP837Dvw7zt+bo6MAJ53RMDfWVpkilCJTU8SqdXvp4CBCPX44psmqMCRlTPVZUQVURkXJ1esc7CFD1H9lATcgag7Fm70yDoqiW0xiDqmKNXjsE8GqCV7u7z1EsFPj67TPGWIwBFKQCEEQUh3wIVC8PDfVdirRF7p2KdjA+PkEkEmVrO8uvn7vYwB6oSjaLPDAA/f399YODF58kxpKJnvO9TdW/iwip1BzpxRSrq+8oFguICCKyWywEwhagpeV4sq6ufqC350LTfuEgm92k+VgziRu3uDl2m9raIKoKSmphYaHkJZOJ+7FY55l4fOToQT0mJh8zOzuN7FlojS1/oAowA2Cnpp5NZrObnxYzr/ctz8/PMj39At/3y7aJ4MThnMOJoOrPAAQAVlbeZ0SK4VCo4UpX11kAGhqOkMksspvPlT1XUKlY+X1+bulhBQAQDjeeXF55e31jY53W1gjRaJTh4RF83+FciVw+R6lUKkOE5+vrWy/3edLXd7rxtx98ao0Z9Dyvtj0a9TpinTbS1m7rgkGTy+fM2toX3d7Zcbn8j7tv0stT/BfxB+vd+QMX9EoXAAAAAElFTkSuQmCC";


FireGPG.Const.Gmail2.IMG_MAIL_NOTHING = FireGPG.Const.Gmail2.IMG_ENCRYPTED2; //FireGPG's logo
FireGPG.Const.Gmail2.IMG_MAIL_ERROR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB9kHGgsDHqkWDe0AAAJRSURBVDjLxZNPSJNxGMc/z7t3m5tNXc0Um6tUOmiTUsm/gQfTDt26KBh06liXbh4iyFNBR6FbJJpZHSQiIkQ0waSalpke9OByk4naWrO5d3t/HZSxMujQoQceHngeng/P83144H+b/CnZ3t50OJ1WXUpwZJKmmQkmpFSa5xMTb+b3AdraWsoU5kcRcYpklxVKgVIK0zR3Y1pd1n8HKGXc0CxWpyaCaLI3pqBQKLXrIoJSCk3UhX0A3Wo/7/efYieRYGl5ERENEUCBmQGYmKYijTlnyW5uba1v8B7xXjvqO05v7228Xh+h8Cqxb1E0yx4oSzYNs0cAGhsbHc3NZ+52dnV31pyuzc/ePbm1xYfhRyQ/z/Pje4yF7Rhvo5uE00Z0J2Hx6ADFxYe6c3IcTbU1dfnZEyW3tggNDXEsGCTH7sCw2jlx0EOp6LxYD8/0jY2l9O7uzutlZeWVbW3nCn7XY+jWTep2DDztHYgIWjyOq6CA8pERGlZD9AFaf//DO6urXxZeT47/0jw6+oqNmQCSNIgrha2lBWdHBym3m+jaGtaVYB6ABSAQmJ00zR2P05l7tqrqJAC5uQf4NDiIK76N7naTV12NxekkMjXF4sAAX0Ph0LNU6l7mCh5PXtH7wLuLweAKJSVefD4f5sYmwelp8v1+UobBeiCAstlYHhtT0Uhk/CU8ychdX1+RlzTsDzSRZl3XbaU+n17hyrcUzc5Zc6Ix0URIbGxgLywksrwUthipqz3wWP72K5egPVfkigsqRSlbAoJReLoN94ch+s/f+BMQoPJkPt9JyAAAAABJRU5ErkJggg%3D%3D";

FireGPG.Const.Gmail2.IMG_MAIL_SIGNED_OK = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAMoQAADKEBQYPKVwAAAAd0SU1FB9kHGgo6A8VWhrkAAAK0SURBVDjLjZNPaJt1GMc/759kSWjWNk2ZNV0dk9RRq71s1C1aBx62QzzIYCcP4kH8B4J48DYYHsUdRPGgoKDgYTAdQhXsoUNUxpJ1a13XjkK6KJp1SZO+b95/v1/ex4vLYU63Bx6e5/B8P3yfBx6Lu6Jc4tkP3i5UgsgZfLRAZb1OyINGucT0xvwTWpZnRVYOy9r5KVUu8U65ROpBxHuXzk75sjonsvqMyG8lkZWnJF6elcVPH/HKJY7fS2fead54cX9lZmYshZ0EKwmWDYaFIcLcwXz6yWLm3f8ElEuMHC0VRkmmwUqAYYAIIP3Bqze87//PQcFOJMCwQGLoaYh1v/qBAli4F8C+AzBFQ+BCT/2Tmlj3OFezWRqYkAMfzn6z34tqGn3q46e/+vFuB+OG8iF0+eXXTVAhrZbPqbXdLE8fIT1ZNIaGhh4efWj0SG4w98NL371w5l8rEHkS+47kMgLK56MlhSoeIA5iQjcidEMCN0AF2hwYyL557MvZo32AYVAg8ozqlS2jOGbItfUdNrJ5Il/hOh6u4+I6XTodhzFznNALbeXqt/qAxyd2Paa9Lu1OgNkLjZ+v7kgjjFVrexvLN2k2WzjODs/tOc7NZo0/tupst7cn+0fMZ/XEhWqHQ5NJFqttOf1FsJh/9daMmbaHB+0hXp5+nVQizYXNBar1S4gWIhV5fYDbjYevbSpuNlTvzLfx+/UGF42t1unMcGa46l1iJJPn8N455q+fBy1ILyYQfwXAAhjI8vyWIyPzFXlt6QafA5XQjwbTxcTBdDKdqrU2uPznRYIgQGK43W7+1bGbJ7oLcdcCWK/ztWnxyeV1fgI8AH1LVkPL361z0b6EbWeU0kagg7hxu1HrdNqvNN5TVwCM+/xYzsxycteUeSw1bu0LftfVcE0+i9usADsAfwMP0Varg8HQ3AAAAABJRU5ErkJggg%3D%3D";
FireGPG.Const.Gmail2.IMG_MAIL_SIGNED_PART = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAMoQAADKEBQYPKVwAAAAd0SU1FB9kHGgo7HSZCipsAAAKvSURBVDjLfZNNSFRrGMd/73tmnA+b7KghpNVQaR8GUhRR0RfdPha1KajWdxHdS9EuatOHRGAEbVq0CQpatCwJLO8VqmstpJlStMwSbCxuR5svp5k5M+ec921hWZj5hwceeJ7n9/9vHoNp2mfu3nZtaVssrwpVS4PR2JA9XGIWiWnHq9u2tL4MNVYawhDkB3Lu6WfnzgDX7qc77VkB+8zdCy+tPTsU2WAGAVCA0mhPk/rXKp5PXD5wP935YDpAfm9ONZyIzd1UHRSGQAgxOZGTfHNnXailsvn0TAnkN/ea+l3R+bJCIgzxE/aHevMDD34LAOplhZxy1J4GBdpRaA2q4AF0zQqAyUVVVuBqVFmhyorc0xT53qxu23zhbt+O7qd92/77YyZAgyorlO2R7hhDuRrHKvHp0QeCjZWEV0WEvy6wILA4tMk/P/Cwp+Wfq78k0I7SylbaiPjQJcVArB9zcTWq6OFl3alSticDkcDx9pW3twP4AERzZ/2SI29F7NUX1h4O68GEK9rXROluWgFSIKRGa3Bcl2Vzmhiw+nzDiXcnOcYjCdC8KLDcLeTJZG2kVxLP+ia0VVJOKp3GKEqSyRS53AQ76/aSSI7wcXyUdCbdNJWgNuIuehLPsr6pgsfxjG69ZT+uPTbWIkM+s8o3jz9X/03QH+LJ+y7io8/RrqbslAtTgC95Zb5675CwHO/qPXVl1KJHjKdaw2bYjBeeUxOuZePCrXQMtoOr0Z7C1sV+AANgToT94zld0xHTf718y00gViqWq0KN/nWhilBwJDXMi/97sG0breBzJvkp60sezHepvAEwNModaXD9xRDdQAHAHdOvS0Zxrltdjvp9vrDjuMJ2bWV9tkay2cxR66LT+8s3zqBqGeFQYJXcE2wwovYHN156o2+oDP3ABMBXKzRMitg5suwAAAAASUVORK5CYII%3D";
FireGPG.Const.Gmail2.IMG_MAIL_SIGNED_ERR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAQCAYAAAAmlE46AAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAMoQAADKEBQYPKVwAAAAd0SU1FB9kHGgsBCoH6uxIAAAKRSURBVCjPdZBLSFRxFMZ//zt3dGac0UZNiClJe+eIEonKrcyIIBwT2wVB6+y1C6KF7SJatIgKalGLCIKoqKw2LSwyWzgomqb5CsNXNs3ozHXuvE6LrMTqg4+zOOcH33cQEX45YFD37Ipv7nA9lwIG3uW7lV4O+UdelKekt1qkr1Y+PdueDBicDRg4/wsGDNZ1P9i+KAN7RAZ2i3wwRPpqJNNbLR13SsyAwcGVoAZw4mhpV0XFGgd6FtiywKaDsqFEqK3Md9btyGtlhbTGXapgr+FbTZYTbHZQCkQA+X3UHow8/gsEfLrdDsoGkoF0CjKp3zMeTwK8WgnqgE+TFMSjkE4uOcX0ZIJvbZvJ14rkTvX+jtGWlvBCKHTh+f37184tdVyrkotgRXnX+RmSFp3tMawnNZS4SvDaHcqh63p+Xl5hkc93te7QobsXlfoZlYQpmcUFyXcJX2eiZN6V4MnxoKqqSG/dSkrT0A8cIO12q5zc3CMby8oadaXwkTBVsD/Kji0uedQWVn5HEabTibe5mUwySWx4GLffTyyRwAoGtbRlHdPKirO3pMwY4UgcLW2p2V6RhGVhjo0xfusWNoeDXL+fhbExRm/e5OvICKHJyY1aoSdV/DoYoWoDtAfD8rgzMjg7McHM9DQJXf/zRbeb+Xicb1NTxEwzpEVjGW//5yQP38TSp67HL/eGEreHhocXZyMRipuamOvp4X1rK46CAlzbtvE9HCYDgypg8DbXReXgBCe7PvIUmD9ut78s93rrV5WWkjZNIuPjrK6sZCoYZD4a/aJDrQJcFZvwdA/JzK9Y65UqboB7hUrttIlkAyjAglEnnD4v0qZEhH9JKVWwD874oMEOHhO6u+DGJ+gSkfkfE/xmVKU6CsQAAAAASUVORK5CYII%3D";

FireGPG.Const.Gmail2.IMG_MAIL_DECRYPTED = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALGwAACxsBJBCUfQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAL9SURBVDiNbZFLaFRnFMf/5/vu5M4kk5m5c01qwtik1rbBjILBN62LuBBFQexWN2K1dNdFMbHRiA9EVBihW4moISsjFFxKUSRRsAiiTIwZIzHizCR3cufeedzH3Pt1MaaJj8N3Vufjx/+cHwkhsFj9/afXMsbPNTU1/ijLgWbbtidd17sOUGpw8PjSx2VFi4C+vsFfFCWS6u3dwSORiExEqNU8pNMTxtTUmze27fx06tRx41MAA4CTJ89vam4Opfbv39sYiURk23bE7Ow7V9d1N5lcG+npWf8D53TnSwkYAGja3JU9e3Y1EBGePXteSqWu3jtx4s9bw8MjT8bGHi10dKyS43Fl+8DA2W8/AxARVFXZGAqFpEqlivv3H0wMDV07/Pjx+G+jo7cHpqamS5lMphiPK8w0jUOfAiQACIfDQcYYNK3gGYYxDuCtEAJE9I9pmtVsNhdUFLXZsqzuzxIsXJDbVcojYGbQYL7GurjRbl6Uk/blYLd5Ue5OBBdiUXc2IJenKRHItRDRxxZylxpdOVpPgvpMYJnaQgV0s3UzvGQXGqJhOGXLLWjmeMGc3ze8+64hVTzOWtdZ9XNKABjo1QQwNyPQtgb4q7UX0a4kJEbwbAHO5EA8Ju2o2W5627WuNVLZ5YAOgNe7BuDAHzVMvhc4+ns75J87UDEtMAJ8CPieD5lCCElN7TEWvySVbA4YH4RyQJKADZ2E7IKArkYRLlZAnAASEMxHW2gVojyGl/k0irqxRSrbnJYDwAHmA44HGJUyqvN5JNSv0dO2CUVHR5eaxOWHZ+BYDspWqVEqVzlQ/XBAVl8hPSvwXQtB5DVk1Sxyeg5tTQkc7vkVx/4+CMdxIXzAdq0MjRxJ+LtXa/S/BQKIBChAGE57uJFQwGNfgSRghdKCQlGDEAJGyTDmrFyvJAlbu/c6Gl4Su/gA1Re0+mmVp79/x/jKOOXn86iJGgqaNq/PGFfzQ9V/CUDn0gJf7Cg1YGcwSVtD3wQSdtZ7W33h3fV1jAkhnv4HD39KBvLRixYAAAAASUVORK5CYII%3D";
FireGPG.Const.Gmail2.IMG_MAIL_DECRYPTED_PART = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALGwAACxsBJBCUfQAAAAd0SU1FB9kHGgsGKWzcXKcAAALvSURBVDjLbZFfaFt1FMc/5/5+N2narkmTdWnStHbt7MQW5sY2pUyFiYjonsQX/7wM/0xkj76L+KZCffLRIRsDcQxmhTGsA1GHoEzRNt2KnTSbTdIkTS65zZ+be38+1NJ27nDOy+HwOed7vmKMYSuuJi89qkR/GLdiJ3qkZ49r3NsN0zwHzJxYfW57cEfIFuBq8tKbKTU4M/zyqLL26bAowbQMze/rTiGb/9s1G09Orz7r3A+wAK4Pzh5LqMTMQ+8e6Lb26bBpGNP+s+n5q57XdbK3L/1U5qAt9uUHXWAB5Px7n4y/OhESJTSv1esXPjs/987ls+dnv5r9xb1YXQ89Fgmn7OT03OCV8fsBWkT4Lvn1UatP6cDxubbw7eLZynungbXf2n9Mp3Xq3KGfD1lq2I6Ub1VeB97fBQCIW/1dYgte1vPX/NINIGeMQUSul/1yw1tqdem0vadmnMn/SVgZmk8rUQQVn8DxGdOj6dzIwtTd8cXJ3MjCZMyKxuhgB44vUekbEJHdLuRGFjxrr9I7ervsCkq+AISOd6MSisAJvM5K+0ZQ8k8NLR50ZHnod7/vxbiFBWILaKH1o8t6bp34RAJ/tUPoeIStzcYYaBq8O+1/lnJLB/TGmafZf9QFBSjoAIe/7HC7YHjrlTThl15AaxtLIMAQ+AFhieBu1NPZ5fmPdL2lwPnPUAVaw+FRIb9uqCai9NY2ECUgBmMFpCLDRFWMW8UstarzuHZbSnYCUGAF0PbB2XBplIpkEiMcSR2j1q7ySGKKj3/4gHazjdusd2u3oaAByCakA2TvGh4eEEyxTD6Rp1AtkOrJcPrIGd6+8hrttocJoOU1/5KLb2SC58fKmx+SzRIxiC1cyPp8kelHxZKIhr39A1RqZYwxOHXHWWsWTmptWuW55WjvtrFbCYnAyNjNhspO3LPUYFyKpSId06FSLpeqK86nxc8bvwowui3ggRWVEM90TckTkf12ppX3c415/5ugyk/GmJv/AmVrSp9tZu/RAAAAAElFTkSuQmCC";
/* NO USED ? */FireGPG.Const.Gmail2.IMG_MAIL_NOT_DECRYPTED = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALGwAACxsBJBCUfQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAL+SURBVDiNdZFfaJV1GMc/z+897/m388+dbdocMpqtxlm4XBaDbGgX4aDAiyAJvLGgeyHFqQMpRFbRBK/Cq7IhgkgKkkEXDhxKCTWdbuecdmrOdc7OOXvPn/f8f8/bxZyZ2cPzvf1+v8/zEdu2WZ8jR068JCKf+nzunS6XO1guV+YbDetbkC/Gxg5ZPGNk3eDw4bEPQyH/xK5dwyoUCrpFwLIs7t2bK8RiC4uVSu2N48cPrT5t4AA4duyzHX6/5/Teve94QKjVaqyspOsul5NIpM8fCAS23rz58/fAzqcNlIiQzabG9+x5W1dKMTMzU5yYOP3T0aOj3507N3lraurG6pYtXc62tvCro6Mntj+zQWtr66DX63GUSmWuX5+aP3v26wPAcjwefy0U2vDNxo3tEg63tszOzu0Hbv/HwOfztSilyGQyVjZr3AAStm0jIlP5fMFMpVItmzZ16pVKqUdEePLxavWkqzMsKfRCHFfxd7a1FZ4rnHL1Vz93RwqnXP1dbmNDsPHAoRfibNaTHZVxl/oXheS4t+4KrjVBALB5IgER+evOK/jtfrxOH8VatW4Y+R9/nZ5+94P5ectRsjTV8XIF1KODFBKdg1TC5vUh4c7kbnoC29AbDZoIfk+L7nR7R3oHBxMnRbodZl0DA9DW1BR475MGdx/YXHp/MwNtL9Ls60OGh6mcP497ZIR6PI53ebnr+YGBrxzFqgZ51hpooBywo0dYTNvUs2Hq/iqmUgS7u9EPHkTpOsbCAsbSEkY6/aYyq5qQh8fKgVhgNcE0imRSKZavXCEXjaJ0nVoux+yZMzy8fx8jmfQos6xBGSgBJjQLcHfR5oV2YcVMshiLYUciBHt7Wbh8Gd3vp3PfPrKZDEa9/tBhVjRyRQePKQhc/VhDdGE6Vmf20p8UL14kHY2ydO0a7UNDGIkE6WrVTMOXcuFA+4oSzfcPtvUFBLn9i6kxV1ZO05J1vCbk/oALk7b9kQDdj7LV/yjgh93b4a0O6DQg/Rv8kISrwK2/AbvKQOYDlrSwAAAAAElFTkSuQmCC";



/*
   Class: FireGPG.cGmail2
   This is the main class to manage gmail's function with the new interface.
*/
FireGPG.cGmail2 = {

    /*
    Variable: doc
    A list of document who can be used.
    */
    doc: Array(),

    /*
    Variable: docOccuped
    A list of document who wait to be checked.
    */
    docOccuped: Array(),

    /*
    Variable: current
    The current document id used (to be unique)
    */
    current: 0,

    /*
        Function: checkDoc
        This function check a document for sign and button to add on a page.

        Parameters:
            id - The document 's id of the click.
    */
    checkDoc: function(id, retry) {

        try {

            var i18n = document.getElementById("firegpg-strings");

            var doc = FireGPG.cGmail2.doc[id];

            if (doc != undefined && doc.location != undefined) {

                var final_location = doc.location.href;

                var regrex = new RegExp('^https?://mail.google.com/a/[a-zA-Z.0-9-]*');

                final_location = final_location.replace(regrex, "http://mail.google.com/mail");

                if (final_location.indexOf(FireGPG.Const.Gmail2.GMAIL_MAIN_DOC_URL) == 0 || final_location .indexOf(FireGPG.Const.Gmail2.GMAIL_MAIN_DOC_URL2) == 0) {

                    if (doc.location.href.indexOf("?ui=2") != -1)
                        FireGPG.cGmail2.baseUrl = doc.location.href.substring(0, doc.location.href.indexOf("?ui=2"));

                    //test for messages
                    var listeTest = doc.getElementsByClassName('gE iv gt','div');

                    for (var i = 0; i < listeTest.length; i++) {
                        listeTest[i] = listeTest[i].parentNode;
                        if (listeTest[i].hasAttribute("gpg") == false) {
                            listeTest[i].setAttribute("gpg","ok");

                            try {

                                var boutonboxs = listeTest[i].getElementsByTagName("table");

                                var boutonbox = "";

                                //On cherche la boite avec les boutons
                                for (var j = 0; j < boutonboxs.length; j++) {
                                    if (boutonboxs[j] && boutonboxs[j].getAttribute("class") && boutonboxs[j].getAttribute("class").indexOf("cf gz") != -1) { //EWdQcf
                                        boutonbox = boutonboxs[j].firstChild.firstChild;
                                        break;
                                    }
                                }

                                if (boutonbox == "" || !boutonbox)
                                    break;

                                FireGPG.debug("ok");
                               // var contenuMail = this.getMailContent(listeTest[i],doc);

                               var td = doc.createElement("td");

                                var mimeContentOf  = this.getMimeMailContens(listeTest[i],doc);

                                if (mimeContentOf == "{ERROR,WAIT}") {
                                    listeTest[i].removeAttribute("gpg");
                                    if (retry == undefined)
                                        retry = 0;

                                    if ( retry < 10) {
                                        setTimeout("FireGPG.cGmail2.checkDoc("+id+", "+ (retry+1) + ")", 1000);
                                        FireGPG.debug('Reask (' + retry + ')', 'Checkdoc');
                                        FireGPG.cGmail2.docOccuped[id] = true;
                                        break;
                                    } else {

                                        td.setAttribute("style","color: red;");
                                        td.innerHTML = '<span title="' + i18n.getString("noDataFromServer") + '" onclick="alert(this.title);  return false;"><img src="' + FireGPG.Const.Gmail2.IMG_MAIL_ERROR + '">&nbsp;' + i18n.getString("error") +'</span>';

                                    }
                                } else {

                                    var decoder = new FireGPG.Mime.Decoder(mimeContentOf);

                                    var nosign = false;

                                    if (mimeContentOf == "" || mimeContentOf == null) {
                                        td.setAttribute("style","color: red;");
                                        td.innerHTML = '<span title="' + i18n.getString("noDataFromServer") + '" onclick="alert(this.title);  return false;"><img src="' + FireGPG.Const.Gmail2.IMG_MAIL_ERROR + '">&nbsp;' + i18n.getString("error") +'</span>';

                                    } else {

                                        listeTest[i].setAttribute("firegpg-mail-id", decoder.extractMimeId());

                                        result = decoder.detectGpGContent(FireGPG.cGmail2.noAutoDecrypt);
                                        var i18n = document.getElementById("firegpg-strings");

                                        if (result.decryptresult && (FireGPG.cGmail2.noAutoDecrypt || result.decryptresult.result == FireGPG.Const.Results.SUCCESS))  {

                                            if (FireGPG.cGmail2.encryptIfDecrypted)
                                                listeTest[i].setAttribute("firegpg-encrypt-this-mail", "firegpg-encrypt-this-mail");

                                            if (FireGPG.cGmail2.noAutoDecrypt) {
                                                td.innerHTML = i18n.getString("GMailD");

                                                var tmpListener = new Object;
                                                tmpListener = null;
                                                tmpListener = new FireGPG.cGmail2.callBack(doc)
                                                td.addEventListener('click',tmpListener,true);
                                                td.setAttribute("style","");
                                                td.setAttribute("firegpg-mail-to-decrypt", result.decryptDataToInsert);

                                            } else {

                                               this.setMailContent(listeTest[i],doc,result.decryptDataToInsert);

                                               if (result.moreDecryptData && result.moreDecryptData.length > 0) {

                                                    for (var titop = 0; titop < result.moreDecryptData.length; titop++)
                                                        this.setMailContent(listeTest[i],doc,result.moreDecryptData[titop]);

                                               }

                                                if (FireGPG.cGmail2.decryptOnReply)
                                                    listeTest[i].setAttribute("firegpg-decrypted-data", result.decryptDataToInsert);


                                                td.setAttribute("style","color: blue;");

                                                if (result.completeSignOrDecrypt)
                                                    td.innerHTML += '<span title="' + i18n.getString("emailDecrypted") + '" onclick="alert(this.title);  return false;"><img src="' + FireGPG.Const.Gmail2.IMG_MAIL_DECRYPTED + '">&nbsp;' + i18n.getString("decryptedMail") + '</span>&nbsp;';
                                                else {

                                                        data = decoder.washFromPlain(result.specialmimepart).replace(/<br \/>/gi, '\n');
                                                        rid="firegpg" +  FireGPG.Misc.genreate_api_key() +  "subpart" +  FireGPG.Misc.genreate_api_key() + "display" +  FireGPG.Misc.genreate_api_key();

                                                        td.setAttribute("style","color: magenta;");
                                                        td.innerHTML += '<span title="' + i18n.getString("OnlyASubPart2") + ' ' + i18n.getString("emailDecrypted") + '" onclick="alert(document.getElementById(\'' + rid +'\').innerHTML);  return false;"><img src="' + FireGPG.Const.Gmail2.IMG_MAIL_DECRYPTED_PART + '">&nbsp;' + i18n.getString("partDecrypted") + '</span>&nbsp;<span id="' + rid +'" style="display: none">' + data + '</span>';
                                                    }
                                                //td.setAttribute("style","color: blue;");
                                                //td.innerHTML = i18n.getString("GMailMailWasDecrypted") + " ";

                                                //if (result.decryptresult.result.signresulttext != null &&  result.decryptresult.result.signresulttext != "")
                                                //    td.innerHTML +=  i18n.getString("GMailSOK") + " " + FireGPG.Misc.htmlEncode(result.decryptresult.result.signresulttext) + " ";

                                                if (result.decryptresult.signresulttext != null &&  result.decryptresult.signresulttext != "") {
                                                    var bonus;

                                                    if (FireGPG.cGmail2.showUserInfo)
                                                        bonus = " (" + FireGPG.Misc.htmlEncode(result.decryptresult.signresulttext) + ")";
                                                    else
                                                        bonus = "";

                                                    if (result.completeSignOrDecrypt)
                                                        td.innerHTML += '<span title="' + i18n.getString("goodSignFrom") + ' ' + result.decryptresult.signresulttext.replace(/\\/gi, "\\\\").replace(/"/gi, "\\\"") + '" onclick="alert(this.title);  return false;"><img src="' + FireGPG.Const.Gmail2.IMG_MAIL_SIGNED_OK + '">&nbsp;' + i18n.getString("signedMail") + (result.notTrusted ? " " + i18n.getString('key_is_not_trusted') : "") + '' + '' + bonus + '</span>';
                                                    else {

                                                        data = decoder.washFromPlain(result.specialmimepart).replace(/<br \/>/gi, '\n');
                                                        rid="firegpg" +  FireGPG.Misc.genreate_api_key() +  "subpart" +  FireGPG.Misc.genreate_api_key() + "display" +  FireGPG.Misc.genreate_api_key();

                                                        td.setAttribute("style","color: magenta;");
                                                        td.innerHTML += '<span title="' + i18n.getString("OnlyASubPart2 ")+ ' ' + i18n.getString("goodSignFrom") + ' ' + result.decryptresult.result.signresulttext.replace(/\\/gi, "\\\\").replace(/"/gi, "\\\"") + '" onclick="alert(document.getElementById(\'' + rid +'\').innerHTML);  return false;"><img src="' + FireGPG.Const.Gmail2.IMG_MAIL_SIGNED_PART + '">&nbsp;' + i18n.getString("partSigned") + (result.notTrusted ? " " + i18n.getString('key_is_not_trusted') : "") + '' + '' + bonus + '</span><span id="' + rid +'" style="display: none">' + data + '</span>';
                                                    }
                                                }

                                            }

                                        }
                                        if (result.signResult != null) {

                                           if (result.signResult.signresult == FireGPG.Const.Results.ERROR_NO_GPG_DATA) {
                                                if (FireGPG.cGmail2.nonosign != true && !result.decryptresult && !FireGPG.cGmail2.noAutoDecrypt)
                                                {
                                                    //td.setAttribute("style","color: orange;");
                                                    //td.innerHTML = i18n.getString("GMailNoS");

                                                    //td.setAttribute("style","color: red;");
                                                    td.innerHTML = '<span title="' + i18n.getString("nothingFound") + '" onclick="alert(this.title);  return false;"><img src="' + FireGPG.Const.Gmail2.IMG_MAIL_NOTHING + '">&nbsp;FireGPG</span>';

                                                }
                                                nosign = true;
                                            }
                                            else if (result.signResult.signresult ==FireGPG.Const.Results.ERROR_UNKNOW) {
                                                td.setAttribute("style","color: red;");
                                                //td.innerHTML += i18n.getString("GMailSErr"); //"La première signature de ce mail est incorrect !";

                                                td.innerHTML += '<span title="' + i18n.getString("unknowErrorCantVerify") + '" onclick="alert(this.title);  return false;"><img src="' + FireGPG.Const.Gmail2.IMG_MAIL_SIGNED_ERR + '">&nbsp;' + i18n.getString("error") + '</span>';
                                            }
                                            else if (result.signResult.signresult == FireGPG.Const.Results.ERROR_BAD_SIGN) {
                                                td.setAttribute("style","color: red;");
                                               // td.innerHTML += i18n.getString("GMailSErr") + " (" + i18n.getString("falseSign") + ")"; //"La première signature de ce mail est incorrect !";

                                                td.innerHTML += '<span title="' + i18n.getString("wrongSignature") + '" onclick="alert(this.title);  return false;"><img src="' + FireGPG.Const.Gmail2.IMG_MAIL_SIGNED_ERR + '">&nbsp;' + i18n.getString("wrongSignature2") + '</span>';

                                            }
                                            else if (result.signResult.signresult == FireGPG.Const.Results.ERROR_NO_KEY) {
                                                td.setAttribute("style","color: red;");
                                               // td.innerHTML += i18n.getString("GMailSErr") + " (" + i18n.getString("keyNotFound") + ")";

                                                td.innerHTML += '<span title="' + i18n.getString("noPublicKey") + '" onclick="alert(this.title);  return false;"><img src="' + FireGPG.Const.Gmail2.IMG_MAIL_SIGNED_ERR + '">&nbsp;' + i18n.getString("keyNotFound") + '</span>';

                                            }
                                            else if (result.signResult.signsresulttext != null){

                                                var bonus;

                                                td.setAttribute("style","color: green;");
                                                //td.innerHTML += i18n.getString("GMailSOK") + " " + FireGPG.Misc.htmlEncode(result.signResult.signresulttext); //"La première signature de ce mail est de testtest (testtest)

                                                if (FireGPG.cGmail2.showUserInfo)
                                                    bonus = " (" + FireGPG.Misc.htmlEncode(result.signResult.signsresulttext).replace(/\n/gi, '<br />') + ")";
                                                else
                                                        bonus = "";


                                                if (result.completeSignOrDecrypt)
                                                    td.innerHTML += '<span title="' + result.signResult.signsresulttext.replace(/\\/gi, "\\\\").replace(/"/gi, "\\\"") + '" onclick="alert(this.title); return false;"><img src="' + FireGPG.Const.Gmail2.IMG_MAIL_SIGNED_OK + '">&nbsp;' + i18n.getString("signedMail") + (result.signResult.notTrusted ? " " + i18n.getString('key_is_not_trusted') : "") + '' + bonus + '</span>';
                                                else {

                                                    data = decoder.washFromPlain(result.specialmimepart).replace(/<br \/>/gi, '\n');
                                                    rid="firegpg" +  FireGPG.Misc.genreate_api_key() +  "subpart" +  FireGPG.Misc.genreate_api_key() + "display" +  FireGPG.Misc.genreate_api_key();

                                                    td.setAttribute("style","color: magenta;");
                                                    td.innerHTML += '<span title="' + i18n.getString("OnlyASubPart2") + ' '  + result.signResult.signsresulttext.replace(/\\/gi, "\\\\").replace(/"/gi, "\\\"") + '" onclick="alert(document.getElementById(\'' + rid +'\').innerHTML);  return false;"><img src="' + FireGPG.Const.Gmail2.IMG_MAIL_SIGNED_PART + '">&nbsp;' + i18n.getString("partSigned") + (result.signResult.notTrusted ? " " + i18n.getString('key_is_not_trusted') : "") + ''  + '' + bonus + '</span><span id="' + rid +'" style="display: none">' + data + '</span>';
                                                }
                                            }

                                        } else {

                                            if (FireGPG.cGmail2.nonosign != true && !result.decryptresult && !FireGPG.cGmail2.noAutoDecrypt)
                                                {
                                                    //td.setAttribute("style","color: orange;");
                                                    //td.innerHTML = i18n.getString("GMailNoS");
                                                    td.innerHTML = '<span title="' + i18n.getString("nothingFound") + '" onclick="alert(this.title);  return false;"><img src="' + FireGPG.Const.Gmail2.IMG_MAIL_NOTHING + '">&nbsp;FireGPG</span>';

                                                }
                                                nosign = true;
                                        }
                                       /* if (!result.completeSignOrDecrypt && !nosign) {

                                            data = decoder.washFromPlain(result.specialmimepart).replace(/<br \/>/gi, '\n');
                                            rid="firegpg" +  FireGPG.Misc.genreate_api_key() +  "subpart" +  FireGPG.Misc.genreate_api_key() + "display" +  FireGPG.Misc.genreate_api_key();
                                            td.innerHTML += " <br /><span style=\"color: magenta;\">" + i18n.getString("OnlyASubPart").replace(/%w/, '<a href="#" onclick="alert(document.getElementById(\'' + rid +'\').innerHTML);">').replace(/%w2/,
                                                                                                                                                                                                 '</a><span id="' + rid +'" style="display: none">' + data + '</span></span>');
                                        } */ //

                                        var atts = result.attachements;

                                        var attachementBoxL = listeTest[i].parentNode.getElementsByClassName('hq gt', 'div');
                                        var attachementBox = attachementBoxL[0];

                                        for (i in atts) {

                                            att = atts[i];

                                            switch(att.type) {
                                                case "decrypted":

                                                    var table = doc.createElement('table');

                                                    table.innerHTML = '<tbody><tr><td class="hw"><span id=":ga"><a href="#"><img gpg_action="sattachement2"  class="hu" src="/mail/images/generic.gif"></a></span></td><td><b>%n</b>  <br>%t&nbsp;&nbsp;<span id=":gd"><a href="#" gpg_action="sattachement">%s</a>&nbsp;&nbsp;</span></td></tr></tbody>';
                                                    table.innerHTML = table.innerHTML.replace(/%t/, i18n.getString("decryptedfile"));
                                                    table.innerHTML = table.innerHTML.replace(/%s/, i18n.getString("SaveAS"));
                                                    table.innerHTML = table.innerHTML.replace(/%n/, FireGPG.Misc.htmlEncode(att.filename));
                                                    table.setAttribute('firegpg-file-content',FireGPG.Misc.Base64.encode(att.data,true));
                                                    table.setAttribute('firegpg-file-name', att.filename);
                                                    table.setAttribute('firegpg-file-type','decrypted');
                                                    table.setAttribute('class', 'cf hr');
                                                    table.setAttribute('gpg_action','attachement');
                                                    var tmpListener = new Object;
                                                    tmpListener = null;
                                                    tmpListener = new FireGPG.cGmail2.callBack(doc)
                                                    table.addEventListener('click',tmpListener,true);

                                                    attachementBox.appendChild(table);

                                                    break;

                                                case "encrypted":

                                                    var filesNames = attachementBox.getElementsByTagName('b');

                                                    var tableBox = null;

                                                    for(fm in filesNames) {

                                                        if (filesNames[fm].textContent == att.filename) {
                                                            tableBox = filesNames[fm].parentNode.parentNode.parentNode.parentNode;
                                                            break;
                                                        }
                                                    }

                                                    if (tableBox == null) {

                                                        var tableBox = doc.createElement('table');

                                                        tableBox.innerHTML = '<tbody><tr><td class="hw"><span id=":ga"><a href="#"><img class="hu" src="/mail/images/generic.gif"></a></span></td><td><b>%n</b>  <br>%t&nbsp;&nbsp;<span id=":gd">&nbsp;&nbsp;</span></td></tr></tbody>';
                                                        tableBox.innerHTML = tableBox.innerHTML.replace(/%t/, i18n.getString("firegpgencrypted"));
                                                        tableBox.innerHTML = tableBox.innerHTML.replace(/%n/, FireGPG.Misc.htmlEncode(att.filename));
                                                        tableBox.setAttribute('class', 'cf hr');

                                                        attachementBox.appendChild(tableBox);

                                                    }

                                                    var spans = tableBox.getElementsByTagName('span');
                                                    interstingSpan = spans[1];

                                                    var newA = doc.createElement('a');
                                                    newA.setAttribute('firegpg-file-content',FireGPG.Misc.Base64.encode(att.data,true));
                                                    newA.setAttribute('firegpg-file-name', att.filename);
                                                    newA.setAttribute('firegpg-file-type','encrypted');
                                                    newA.setAttribute('gpg_action','attachement');
                                                    newA.setAttribute('style','cursor: pointer;');
                                                    newA.innerHTML = i18n.getString("decrypt");
                                                    var tmpListener = new Object;
                                                    tmpListener = null;
                                                    tmpListener = new FireGPG.cGmail2.callBack(doc)
                                                    newA.addEventListener('click',tmpListener,true);

                                                    interstingSpan.appendChild(newA);

                                                    break;
                                            }

                                        }

                                    }

                                   /*

                                    var encrypted = FireGPG.Mime.Decoder.extractEncryptedData(mimeContentOf).replace(/\r/gi, '');

                                    var firstPosition = encrypted.indexOf("-----BEGIN PGP MESSAGE-----");
                                    var lastPosition = encrypted.indexOf("-----END PGP MESSAGE-----");

                                    if (encrypted != null && encrypted != '' && firstPosition != -1 && lastPosition != -1) {


                                        if (FireGPG.cGmail2.noAutoDecrypt) {

                                            if (td.innerHTML == i18n.getString("GMailNoS") || td.innerHTML ==  "") {

                                                td.innerHTML = i18n.getString("GMailD");

                                                var tmpListener = new Object;
                                                tmpListener = null;
                                                tmpListener = new FireGPG.cGmail2.callBack(doc)
                                                td.addEventListener('click',tmpListener,true);
                                                td.setAttribute("style","");
                                                td.setAttribute("firegpg-mail-to-decrypt", encrypted);
                                                td.setAttribute("firegpg-parse-as-mime", "firegpg-parse-as-mime");
                                            }

                                        } else {

                                            var result = FireGPG.Core.decrypt(false,encrypted);

                                            if (result.result == FireGPG.Const.Results.SUCCESS) {
                                                data = FireGPG.Mime.Decoder.parseDecrypted(result.decrypted); //For reviewers, a washDecryptedForInsertion is applied too in parseDecrypted ;)

                                                this.setMailContent(listeTest[i],doc,data.message);

                                                if (FireGPG.cGmail2.decryptOnReply)
                                                    listeTest[i].setAttribute("firegpg-decrypted-data", data.message);

                                                td.setAttribute("style","color: blue;");
                                                td.innerHTML = i18n.getString("GMailMailWasDecrypted");

                                                if (result.signresulttext != null &&  result.signresulttext != "")
                                                        td.innerHTML += " " + i18n.getString("GMailSOK") + " " + FireGPG.Misc.htmlEncode(result.signresulttext)
                                                else if (data.signData ) {

                                                    var resultTest = FireGPG.Core.verify(true,data.signData.replace(/\r/gi, ''));

                                                    if (resultTest.result == FireGPG.Const.Results.ERROR_NO_GPG_DATA) {
                                                        if (FireGPG.cGmail2.nonosign != true)
                                                        {
                                                            td.setAttribute("style","color: orange;");
                                                            td.innerHTML += " " + i18n.getString("GMailNoS");
                                                        }
                                                    }
                                                    else if (resultTest.signresult ==FireGPG.Const.Results.ERROR_UNKNOW) {
                                                        td.setAttribute("style","color: red;");
                                                        td.innerHTML += " " + i18n.getString("GMailSErr"); //"La première signature de ce mail est incorrect !";
                                                    }
                                                    else if (resultTest.signresult == FireGPG.Const.Results.ERROR_BAD_SIGN) {
                                                        td.setAttribute("style","color: red;");
                                                        td.innerHTML += " " + i18n.getString("GMailSErr") + " (" + i18n.getString("falseSign") + ")"; //"La première signature de ce mail est incorrect !";
                                                    }
                                                    else if (resultTest.signresult == FireGPG.Const.Results.ERROR_NO_KEY) {
                                                        td.setAttribute("style","color: red;");
                                                        td.innerHTML += " " + i18n.getString("GMailSErr") + " (" + i18n.getString("keyNotFound") + ")"; //"La première signature de ce mail est incorrect !";
                                                    }
                                                    else if (resultTest.signresulttext != null){

                                                        td.setAttribute("style","color: green;");
                                                        td.innerHTML += " " + i18n.getString("GMailSOK") + " " + FireGPG.Misc.htmlEncode(resultTest.signresulttext); //"La première signature de ce mail est de testtest (testtest)
                                                    }

                                                }
                                            } else  {

                                                td.setAttribute("style","color: red;");
                                                td.innerHTML = i18n.getString("GMailMailWasNotDecrypted");
                                            }
                                        }

                                    } else {

                                        var encrypted = FireGPG.Mime.Decoder.extractEncrypted(mimeContentOf).replace(/\r/gi, '');

                                        var firstPosition = encrypted.indexOf("-----BEGIN PGP MESSAGE-----");
                                        var lastPosition = encrypted.indexOf("-----END PGP MESSAGE-----");

                                        if (encrypted != null && encrypted != '' && firstPosition != -1 && lastPosition != -1) {

                                            if (FireGPG.cGmail2.noAutoDecrypt) {

                                                if (td.innerHTML == i18n.getString("GMailNoS") || td.innerHTML ==  "") {
                                                    td.innerHTML = i18n.getString("GMailD");

                                                    var tmpListener = new Object;
                                                    tmpListener = null;
                                                    tmpListener = new FireGPG.cGmail2.callBack(doc)
                                                    td.addEventListener('click',tmpListener,true);
                                                    td.setAttribute("style","");
                                                    td.setAttribute("firegpg-mail-to-decrypt", encrypted);
                                                }

                                            } else {

                                                var result = FireGPG.Core.decrypt(false,encrypted);

                                                if (result.result == FireGPG.Const.Results.SUCCESS) {

                                                    data = FireGPG.Mime.Decoder.washDecryptedForInsertion(FireGPG.Mime.Decoder.demime(result.decrypted).message.replace(/\r/gi, ''));
                                                    this.setMailContent(listeTest[i],doc,data);
                                                    if (FireGPG.cGmail2.decryptOnReply)
                                                        listeTest[i].setAttribute("firegpg-decrypted-data", data);

                                                    td.setAttribute("style","color: blue;");
                                                    td.innerHTML = i18n.getString("GMailMailWasDecrypted");


                                                    if (result.signresulttext != null &&  result.signresulttext != "")
                                                        td.innerHTML += " " + i18n.getString("GMailSOK") + " " + FireGPG.Misc.htmlEncode(result.signresulttext)


                                                } else  {

                                                    td.setAttribute("style","color: red;");
                                                    td.innerHTML = i18n.getString("GMailMailWasNotDecrypted");
                                                }

                                            }

                                        }



                                    }


                                    /*var firstPosition = contenuMail.indexOf("-----BEGIN PGP MESSAGE-----");
                                    var lastPosition = contenuMail.indexOf("-----END PGP MESSAGE-----");

                                    if (firstPosition != -1 && lastPosition != -1) {

                                        td.innerHTML = i18n.getString("GMailD");

                                        var tmpListener = new Object;
                                        tmpListener = null;
                                        tmpListener = new FireGPG.cGmail2.callBack(doc)
                                        td.addEventListener('click',tmpListener,true);
                                        td.setAttribute("style","");
                                    }*/

                                }
                                td.innerHTML = '<div class="cKWzSc mD" idlink=""><span class="mG" style="' + td.getAttribute("style") + '">' + td.innerHTML + '</span></div>';


                                //La boite peut avoir été reféinie
                                var boutonboxs = listeTest[i].getElementsByTagName("table");

                                var boutonbox = "";

                                //On cherche la boite avec les boutons
                                for (var j = 0; j < boutonboxs.length; j++) {
                                    if (boutonboxs[j].getAttribute("class").indexOf("cf gz") != -1) { //EWdQcf
                                        boutonbox = boutonboxs[j].firstChild.firstChild;
                                        break;
                                    }
                                }

                                boutonbox.insertBefore(td,boutonbox.childNodes[boutonbox.childNodes.length - 2]);


                            } catch (e) {  FireGPG.cGmail2.error(e, 'checkDock/message') }
                        }
                    }

                    //END OF THE TEST FOR MESSAGES.
    //FireGPG.debug('Begining test for compose messages', 'ProbWithReplyForward');
                    //Test for compose buttons 'CoUvaf'
                    var listeTest = doc.getElementsByClassName('eh','div');
                    var listeTest2 = doc.getElementsByClassName('CoUvaf','div');

    //FireGPG.debug('1:' + listeTest + ' 2:' + listeTest2, 'ProbWithReplyForward');

                    listeTest = listeTest.concat(listeTest2);

                    for (var i = 0; i < listeTest.length; i++) {

                        if (listeTest[i].hasAttribute("gpg") == false) {

                            try {

                                FireGPG.debug(listeTest[i] + 'NoFireGPG, processing', 'ProbWithReplyForward');

                                listeTest[i].setAttribute("gpg","ok");

                                //Position to add the button
                                var spamLimite = listeTest[i].getElementsByTagName('span');
                                spamLimite = spamLimite[0];
        //FireGPG.debug('spamLimite is ' + spamLimite, 'ProbWithReplyForward');
                                //Nouvelle version du lundi 29 septembre 2008
                                if (listeTest[i].firstChild && listeTest[i].firstChild.getAttribute("class") == "c1I77d yCMBJb goog-container")
                                    var wheretoadd = listeTest[i].firstChild;
                                else if (listeTest[i].firstChild && listeTest[i].firstChild.getAttribute("class") == "c1I77d yCMBJb") { //Version du 29 octobre 2008
                                    var wheretoadd = listeTest[i].firstChild.firstChild;
                                    if (wheretoadd.getAttribute("class") != "Q4uFlf goog-container")
                                        wheretoadd = listeTest[i].firstChild.childNodes[1];
                                }
                                else if (listeTest[i].firstChild && listeTest[i].firstChild.getAttribute("class") == "dW D") { //Version du 5 mars 09
                                    var wheretoadd = listeTest[i].firstChild;
                                }else if (listeTest[i].firstChild && listeTest[i].firstChild.getAttribute("class") == "dW") { //Version du 28 juil 09
                                    var wheretoadd = listeTest[i].firstChild;
                                }

        FireGPG.debug('wheretoadd is ' + wheretoadd, 'ProbWithReplyForward');
                                /*if (FireGPG.cGmail2.b_sign == true)
                                    this.addBouton(wheretoadd,doc,i18n.getString("GMailCLS"),"sign",spamLimite);
                                if (FireGPG.cGmail2.b_sign_s == true)
                                    this.addBouton(wheretoadd,doc,i18n.getString("GMailCLSS"),"sndsign",spamLimite);
                                if (FireGPG.cGmail2.b_psign == true)
                                    this.addBouton(wheretoadd,doc,i18n.getString("GMailS"),"psign",spamLimite);
                                if (FireGPG.cGmail2.b_psign_s == true)
                                    this.addBouton(wheretoadd,doc,i18n.getString("GMailSS"),"sndpsign",spamLimite);
                                if (FireGPG.cGmail2.b_crypt == true)
                                    this.addBouton(wheretoadd,doc,i18n.getString("GMailC"),"crypt",spamLimite);
                                if (FireGPG.cGmail2.b_crypt_s == true)
                                    this.addBouton(wheretoadd,doc,i18n.getString("GMailCS"),"sndcrypt",spamLimite);
                                if (FireGPG.cGmail2.b_signcrypt == true)
                                    this.addBouton(wheretoadd,doc,i18n.getString("GMailSAC"),"signcrypt",spamLimite);
                                if (FireGPG.cGmail2.b_signcrypt_s == true)
                                    this.addBouton(wheretoadd,doc,i18n.getString("GMailSACS"),"sndsigncrypt",spamLimite);*/


                                //Rajouter une propriété sur le button send pour le repérer
                                var children = listeTest[i].getElementsByClassName('goog-imageless-button-content');
                                if (!children[0])
                                    children = listeTest[i].getElementsByClassName('J-K-I-Jz');

                                children[0].firstChild.setAttribute("gpg_action", "send_button");
        //FireGPG.debug('children[0] is ' + children[0], 'ProbWithReplyForward');

                                //Listeners
                                try {

                                    var tmpListener = new Object;
                                    tmpListener = null;
                                    tmpListener = new FireGPG.cGmail2.callBack(doc)
                                    listeTest[i].addEventListener('mouseup',tmpListener,true);

                                    var tmpListener = new Object;
                                    tmpListener = null;
                                    tmpListener = new FireGPG.cGmail2.callBack(doc)
                                    listeTest[i].addEventListener('keyup',tmpListener,true);

                                    var tmpListener = new Object;
                                    tmpListener = null;
                                    tmpListener = new FireGPG.cGmail2.callBack(doc)
                                    listeTest[i].addEventListener('keydown',tmpListener,true);

                                    var tmpListener = new Object;
                                    tmpListener = null;
                                    tmpListener = new FireGPG.cGmail2.callBack(doc)
                                    listeTest[i].addEventListener('keypress',tmpListener,true);

                                } catch (e) {  FireGPG.debug(e,'cgmail2.checkDoc',true);  }

                                form =  listeTest[i].parentNode.getElementsByTagName('form');
                                 if (form.length == 0) {

                                    form = listeTest[i].parentNode.parentNode.getElementsByTagName('form');

                                 }

                                form = form[0];

                                findHere = form.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
                                elements = findHere.getElementsByClassName('gs', 'div');

                                if (listeTest[i].getAttribute('class').indexOf('eh') != -1) {

                                    children[0].firstChild.setAttribute("gpg_action", "send_button2");


                                    //Add the button 'Attach and chiffred a file'

                                    var tablebox = listeTest[i].parentNode.getElementsByTagName('table');

                                    //Nouvelle version du lundi 29 septembre 2008
                                    if (tablebox.length == 0)
                                        tablebox = listeTest[i].parentNode.parentNode.getElementsByTagName('table');

                                    tablebox = tablebox[0];
                                    var boxwhereadd = tablebox.parentNode;

                                    var span = doc.createElement("span");

                                    span.setAttribute("style","position: relative;  bottom: 26px; right: 5px; float: right; margin-bottom: -30px;");

                                    span.innerHTML = '<img class="en ed" src="images/cleardot.gif">&nbsp;<span gpg_action="add_crypted" style="font-size: 12px;" class="el">' + i18n.getString("GmailAddChiffred")+ '</span>&nbsp;<span gpg_action="add_crypted_and_sign" style="font-size: 12px;" class="el">' + i18n.getString("GmailAddChiffredSignToo")+ '</span>';

                                    boxwhereadd.insertBefore(span,tablebox.nextSibling);

                                    var tmpListener = new Object;
                                    tmpListener = null;
                                    tmpListener = new FireGPG.cGmail2.callBack(doc)
                                    span.addEventListener('click',tmpListener,false);

                                    //Rajout des trucs à FireGPG
                                    var firegpgactions = doc.createElement("tr");


                                    var title = doc.createElement("td");
                                    var checkboxes = doc.createElement("td");

                                    title.setAttribute('class', 'eD');
                                    title.innerHTML = 'FireGPG:';

                                    randId = FireGPG.Misc.genreate_api_key();
                                    checkboxes.setAttribute('class', 'eC');
                                    checkboxes.setAttribute('style', 'font-size: 12px;');
                                    checkboxes.innerHTML =  '<img id="'+randId+'a" src="'+FireGPG.Const.Gmail2.IMG_SIGN_OFF+'" alt="'+FireGPG.Const.Gmail2.IMG_SIGN_ON+'" onclick="a = this.alt; this.alt=this.src; this.src=a; this.title = (this.title==\'On\' ? \'Off\' : \'On\');" title="Off" class="firegpg-sign">&nbsp;<span class="el" onclick="document.getElementById(\''+randId+'a\').onclick();">' + i18n.getString("GMailS") + '</span>&nbsp;|&nbsp;' +
                                    '<img id="'+randId+'b" src="'+FireGPG.Const.Gmail2.IMG_ENCRYPT_OFF+'" alt="'+FireGPG.Const.Gmail2.IMG_ENCRYPT_ON+'" onclick="a = this.alt; this.alt=this.src; this.src=a; this.title = (this.title==\'On\' ? \'Off\' : \'On\');" title="Off" class="firegpg-encrypt" >&nbsp;<span class="el" onclick="document.getElementById(\''+randId+'b\').onclick();">' + i18n.getString("GMailC") + '</span>&nbsp;|&nbsp;' +
                                    '<img id="'+randId+'c" src="'+FireGPG.Const.Gmail2.IMG_INLINE_OFF+'" alt="'+FireGPG.Const.Gmail2.IMG_INLINE_ON+'" onclick="a = this.alt; this.alt=this.src; this.src=a; this.title = (this.title==\'On\' ? \'Off\' : \'On\'); if (this.title==\'Off\') { document.getElementById(\''+randId+'att\').style.display = \'\'; } else { document.getElementById(\''+randId+'att\').style.display = \'none\'; }" title="Off" class="firegpg-inline" >&nbsp;<span class="el" onclick="document.getElementById(\''+randId+'c\').onclick();">' + i18n.getString("GmailI") + '</span>' +
                                    '<span id="'+randId+'att">&nbsp;|&nbsp;<img id="'+randId+'d" src="'+FireGPG.Const.Gmail2.IMG_ATTACHEMENTS_OFF+'" alt="'+FireGPG.Const.Gmail2.IMG_ATTACHEMENTS_ON+'" onclick="a = this.alt; this.alt=this.src; this.src=a; this.title = (this.title==\'On\' ? \'Off\' : \'On\');" title="Off" class="firegpg-attachements" >&nbsp;<span class="el" onclick="document.getElementById(\''+randId+'d\').onclick();">' + i18n.getString("GmailA") + '</span></span>';

                                    if (FireGPG.cGmail2.default_sign)
                                        checkboxes.innerHTML += '<script>document.getElementById(\''+randId+'a\').onclick();</script>';

                                    if (FireGPG.cGmail2.default_encrypt || (elements[0] && elements[0].hasAttribute("firegpg-encrypt-this-mail") && elements[0].getAttribute("firegpg-encrypt-this-mail") == "firegpg-encrypt-this-mail"))
                                        checkboxes.innerHTML += '<script>document.getElementById(\''+randId+'b\').onclick();</script>';

                                    if (FireGPG.cGmail2.default_inline)
                                        checkboxes.innerHTML += '<script>document.getElementById(\''+randId+'c\').onclick();</script>';

                                    if (FireGPG.cGmail2.default_attachements)
                                        checkboxes.innerHTML += '<script>document.getElementById(\''+randId+'d\').onclick();</script>';

                                    firegpgactions.appendChild(title);
                                    firegpgactions.appendChild(checkboxes);
                                    fileattachimage = tablebox.getElementsByClassName('en ed','img');

                                    if (!fileattachimage[0]) {
                                        fileattachimage = tablebox.getElementsByClassName('en','img'); //Forward ??

                                    }

                                    if (!fileattachimage[0]) {
                                        FireGPG.debug('Unable to add buttons', 'cgmail2-addbuttons',true);
                                    }

                                    filesattachbox = fileattachimage[0].parentNode.parentNode;

                                    try {
                                        tablebox.firstChild.insertBefore(firegpgactions,filesattachbox);
                                    } catch (e) {   FireGPG.debug(e,'cgmail2.checkDoc(insert checkboxes)',true); }

                                    if (FireGPG.cGmail2.decryptOnReply) {

                                        if (elements[0] && elements[0].hasAttribute("firegpg-decrypted-data") ) {
                                            data = elements[0].getAttribute("firegpg-decrypted-data");


                                            if (FireGPG.cGmail2.iframeOrTextarea(doc,wheretoadd) == "iframe") {

                                                var iframe = FireGPG.cGmail2.getTheIframe(doc,wheretoadd);

                                                var baseData = iframe.contentWindow.document.body.innerHTML;

                                                var  before = baseData.substring(0,baseData.indexOf("-----BEGIN PGP MESSAGE-----"));

                                                var after = baseData.substring(baseData.indexOf("-----END PGP MESSAGE-----") + "-----END PGP MESSAGE-----".length, baseData.length);

                                                iframe.contentWindow.document.body.innerHTML = before + data + after;

                                            } else {

                                                var textarea = FireGPG.cGmail2.getTheTextarea(doc,wheretoadd);

                                                var baseData = textarea.value;

                                                var before = baseData.substring(0,baseData.indexOf("-----BEGIN PGP MESSAGE-----"));

                                                var after = baseData.substring(baseData.indexOf("-----END PGP MESSAGE-----") + "-----END PGP MESSAGE-----".length, baseData.length);

                                                textarea.value = before + data.replace(/<br \/>/gi, "\n> ") + after;

                                            }
                                        }

                                    }

                                }



                                form.setAttribute("firegpg-mail-id", "");
        //FireGPG.debug('Setting mailid', 'ProbWithReplyForward');
                                if (elements[0]) {
                                    form.setAttribute("firegpg-mail-id", elements[0].getAttribute("firegpg-mail-id"));
                                    FireGPG.debug('to ' + elements[0].getAttribute("firegpg-mail-id"), 'ProbWithReplyForward');
                                }


                                var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                                       getService(Components.interfaces.nsIPrefService);

                                prefs = prefs.getBranch("extensions.firegpg.");
                                try {
                                    disable_autosave = prefs.getBoolPref("gmail_disable_autosave");
                                } catch (e) {
                                    disable_autosave = false;
                                }

                                 // Based on code of Gmail S/MIME
                                /*
                                    Copyright (C) 2005-2007 Richard Jones.
                                    Copyright (C) 2007-2008 Sean Leonard of SeanTek(R).

                                    GPL 2 License.
                                */
                                // Disable autosave and add appropriate notification
        //FireGPG.debug('Disable autosave ?', 'ProbWithReplyForward');
                                if (disable_autosave && form) // && form
                                { // FireGPG.debug('Disabling autosave', 'ProbWithReplyForward');

                                    String.prototype.startsWith = function(s)
                                    {
                                        return (this.match('^'+s)==s);
                                    };

                                    String.prototype.trim = function() {
                                        return this.replace(/^\s+|\s+$/g, '');
                                    };


                                   var subj = form.elements.namedItem("subject");

                                    // STGS Method
                                    function getValue()
                                    {
                                        // found two bad patterns: $q$_P$xVa$ -> t_a -> OP -> yUa -> BXa [->call] ...
                                        // $q$_P$UWa$ -> O0a -> iQ -> WVa -> YYa [->call] -> $CNp$ [->apply] -> $e$ ...
                                        // thus, search for what the stack function names start with
                                        if (getValue.caller == null) return this.__proto__.__lookupGetter__("value").apply(this);
                                        function stackMatch(pattern, func)
                                        {
                                            for (var i = 0; i < pattern.length; i++)
                                            {
                                                if (func == null) return false;
                                                if (func.name.indexOf(pattern[i]) != 0 && func.name.indexOf(pattern[i]) != 3) return false;

                                                func = func.caller;
                                            }
                                            return true;
                                        }
                                        const badpattern1 = ["$mnb", "$knb", "$Zmb", "$1lb", "$Fjb", "$Ejb"];
                                        const badpattern2 = ["$EUa", "$CUa", "$fUa", "$jTa", "$xRa"];
                                        const badpattern3 = ["$R$_P$", "$R$_P$", "$R$_P$", "$R$_P$Lfb$", "$R$_P$xib$", "$Ouc$"];
                                        const badpattern4 = ["$Y$_P$", "$Y$_P$", "$Y$_P$", "$Y$_P$Uib$", "$Y$_P$Glb$"]; // then $rga$, $e$, $a$__protected__$
                                        const badpattern5 = ["$Z$_P$", "$Z$_P$", "$Z$_P$", "$Z$_P$ZBa$", "$Z$_P$nGb$"];
                                        const badpattern6 = ["$Z$_P$", "$Z$_P$", "$Z$_P$", "$Z$_P$", "$T_$_P$YHa$"];
                                        const badpattern7 = ["$Z$_P$", "$Z$_P$", "$Z$_P$", "$Z$_P$ptb$", "$E0$_P$BJa$"];
                                        const badpattern8 = ["$abb", "$9ab", "$Jab", "$L$a", "$u8a"];  //     $t8a
                                        const badpattern9 = ["EXc", "$8Ua", "gUc", "fUc", "$ATa"];  //         hla
                                        const badpattern10 = ["Qsa", "Jsa", "Jkb", "$wTa", "$xTa"];  //         xta

                                        const badpattern11 = ["nWc", "$DWa", "yTc", "xTc", "$1Ua"];  //         Cpa
        /*
        EXc $8Ua gUc fUc $ATa hla

        Zna Vna UIb $RQa $SQa Moa

        Zna Vna UIb $RQa $SQa Moa
                                                                                                      */

                                        if (stackMatch(badpattern11, getValue.caller) || stackMatch(badpattern10, getValue.caller) || stackMatch(badpattern9, getValue.caller) || stackMatch(badpattern8, getValue.caller) || stackMatch(badpattern7, getValue.caller) || stackMatch(badpattern6, getValue.caller) || stackMatch(badpattern5, getValue.caller) || stackMatch(badpattern4, getValue.caller) || stackMatch(badpattern3, getValue.caller) || stackMatch(badpattern1, getValue.caller) || stackMatch(badpattern2, getValue.caller))
                                        {
                                            function AutosaveWreckingBall() {};
                                            AutosaveWreckingBall.prototype.value = "Wrecked";
                                            AutosaveWreckingBall.prototype.toString = function() { return "[object AutosaveWreckingBall]"; }
                                            throw new AutosaveWreckingBall();
                                        }
                                        else
                                        {
                                            // debugger; // keep this around for later usage when needing to adjust badpatterns
                                            dump(getValue.caller.name + " " +
                        getValue.caller.caller.name + " " +
                        getValue.caller.caller.caller.name + " " +
                        getValue.caller.caller.caller.caller.name + " " +
                        getValue.caller.caller.caller.caller.caller.name + " " +
                        getValue.caller.caller.caller.caller.caller.caller.name + "\n\n");
                                        }
                                        // finally, if nothing matches:
                                        return this.__proto__.__lookupGetter__("value").apply(this);
                                    } // end getValue

                                   function setValue(s)
                                    {
                                        this.__proto__.__lookupSetter__("value").call(this,s);
                                    }

                                    form.ownerDocument.defaultView.setTimeout(getValue.toString() + "\ndocument.getElementById('" + subj.id + "').__defineGetter__('value', getValue);\n" +
                                    setValue.toString() + "\ndocument.getElementById('" + subj.id + "').__defineSetter__('value', setValue);\n",1);


                                    // message about autosave disabled
                                    var spanAS = form.ownerDocument.evaluate(".//div[contains(@class,'dW')]//span[@class='d2']",
                                                                                    form.parentNode.parentNode.parentNode.parentNode, null,
                                                                                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                                    for (var o=0;o<spanAS.snapshotLength;o++)
                                    {
                                        spanAS.snapshotItem(o).innerHTML = i18n.getString("autosave-disabled");
                                    }


                             } // end if autosave disabled




                                //End of code of Gmail S/MIME.

                        } catch (e) {  FireGPG.cGmail2.error(e, 'checkDock/compose') }
                    }
                }
                //END OF THE TEST FOR COMPOSE BUTTONS

                    FireGPG.cGmail2.docOccuped[id] = false;

                }
            }
        } catch (e) {  FireGPG.cGmail2.error(e, 'checkDock') }
    },



    /*
        Function: callBack
        This function create a function witch is called when the user click on a button

        Parameters:
            doc - The document of the button.
    */
    callBack: function(doc) {

        try {

            this._doc = doc;

            this.handleEvent = function(event) { // Function in the function for handle... events.
                try {
                    var i18n = document.getElementById("firegpg-strings");


                   /* if (event.target.nodeName == "SELECT")
                        return;

                    try {

                        if (event.target.nodeName == "OPTION") {

                            var tmpval = event.target.value;

                            var target = event.target.parentNode;

                            target.setAttribute('gpg_action', tmpval);

                            target.value = "FireGPG";
                        } else { */

                            target = event.target;

                /*        }

                    } catch (e)  { FireGPG.debug(e,'cgmail2.callBack',true);  } */


                    if (target.hasAttribute('firegpg-ingore-this-event') && target.getAttribute('firegpg-ingore-this-event') == 'firegpg-ingore-this-event') {
                        FireGPG.debug('event ingored', 'callBack');
                        return;
                    }

                    //Keypress
                    if (target.getAttribute('gpg_action') == null) {
                        list = target.getElementsByTagName('b');

                        for(i in list) {
                            if (list[i].getAttribute('gpg_action') != null) {
                                target = list[i];
                                break;
                            }

                        }


                    }

                    FireGPG.debug('Action: ' + target.getAttribute('gpg_action') + ' T:' + target + ' Tclass:' + target.getAttribute('class')+ ' Tid:' + target.getAttribute('id')+ ' TPclass:' + target.parentNode.getAttribute('class')+ ' TPid:' + target.parentNode.getAttribute('id'), 'callBack');


               //If the user want to decrypt the mail (can use normal attibutes)
                    if (target.innerHTML.indexOf(i18n.getString("GMailD")) == 0) {

                        var tmpNode = target;


                        var result = FireGPG.Core.decrypt(false,target.parentNode.parentNode.getAttribute("firegpg-mail-to-decrypt"));

                        if (target.parentNode.parentNode.hasAttribute("firegpg-parse-as-mime"))
                            result.decrypted  = FireGPG.Mime.Decoder.parseDecrypted(result.decrypted).message.replace(/<br \/>/gi, "\n");

                        if (result.result == FireGPG.Const.Results.SUCCESS)
                            FireGPG.Misc.showText(result.decrypted,undefined,undefined,undefined,result.signresulttext);

                    }     /*
                    else if (target.getAttribute('gpg_action') == "sndsign" || target.getAttribute('gpg_action') == "sign")
                    {

                        var mailContent = FireGPG.cGmail2.getWriteMailContent(this._doc,target.parentNode);

                        if (mailContent == "")
                            return;

                        var result = FireGPG.Core.sign(false,FireGPG.Misc.gmailWrapping(mailContent));

                        if (result.result == FireGPG.Const.Results.SUCCESS) {

                            FireGPG.cGmail2.setWriteMailContent(this._doc,target.parentNode,result.signed);

                            if (target.getAttribute('gpg_action') == "sndsign")
                                FireGPG.cGmail2.sendEmail(target.parentNode,this._doc);
                        }

                    }
                    else if (target.getAttribute('gpg_action') == "sndpsign" || target.getAttribute('gpg_action') == "psign")
                    {

                        var mailContent = FireGPG.cGmail2.getWriteMailContent(this._doc,target.parentNode);

                        if (mailContent == "")
                            return;

                        var result = FireGPG.Core.sign(false,FireGPG.Misc.gmailWrapping(mailContent),null,null,true);

                        if (result.result == FireGPG.Const.Results.SUCCESS) {

                            FireGPG.cGmail2.setWriteMailContent(this._doc,target.parentNode,result.signed);

                            if (target.getAttribute('gpg_action') == "sndpsign")
                                FireGPG.cGmail2.sendEmail(target.parentNode,this._doc);
                        }

                    }
                    else if (target.getAttribute('gpg_action') == "sndcrypt" || target.getAttribute('gpg_action') == "crypt")
                    {

                        //This code has to mix with the previous else/if block
                        var mailContent = FireGPG.cGmail2.getWriteMailContent(this._doc,target.parentNode);

                        var whoWillGotTheMail = FireGPG.cGmail2.getToCcBccMail(this._doc,target.parentNode);

                        if (mailContent == "")
                            return;

                        var result = FireGPG.Core.crypt(false,mailContent,null, false, false,whoWillGotTheMail);

                        if(result.result == FireGPG.Const.Results.SUCCESS) {

                            FireGPG.cGmail2.setWriteMailContent(this._doc,target.parentNode,result.encrypted);

                            if (target.getAttribute('gpg_action') == "sndcrypt")
                            {
                                FireGPG.cGmail2.sendEmail(target.parentNode,this._doc);
                            }

                        }
                    }
                    else if (target.getAttribute('gpg_action') == "sndsigncrypt" || target.getAttribute('gpg_action') == "signcrypt")
                    {

                        //This code has to mix with the previous else/if block
                        var mailContent = FireGPG.cGmail2.getWriteMailContent(this._doc,target.parentNode);

                        var whoWillGotTheMail = FireGPG.cGmail2.getToCcBccMail(this._doc,target.parentNode);


                        if (mailContent == "")
                            return;

                        var result = FireGPG.Core.cryptAndSign(false, mailContent, null ,false,null, null, false, whoWillGotTheMail);

                        // If the sign failled
                        if(result.result == FireGPG.Const.Results.ERROR_UNKNOW) {
                            // We alert the user
                            alert(i18n.getString("cryptAndSignFailed"));
                        }
                        else if(result.result == FireGPG.Const.Results.ERROR_PASSWORD) {
                            // We alert the user
                            alert(i18n.getString("cryptAndSignFailedPass"));
                        }
                        else {

                            FireGPG.cGmail2.setWriteMailContent(this._doc,target.parentNode,result.encrypted);

                            if (target.getAttribute('gpg_action') == "sndsigncrypt")
                            {
                                FireGPG.cGmail2.sendEmail(target.parentNode,this._doc);
                            }

                        }
                    }*/
                    else  if (target.getAttribute('gpg_action') == "add_crypted" || target.getAttribute('gpg_action') == "add_crypted_and_sign")
                    {

                        //Ok, so the user want to crypt a file.

                        //First, we got the file. We will crypt him, and save it the the temp folder. Next, we ask gmail to add the file.

                        //Get the file
                        var nsIFilePicker = Components.interfaces.nsIFilePicker;
                        var fp = Components.classes["@mozilla.org/filepicker;1"]
                                .createInstance(nsIFilePicker);
                        fp.init(window, null, nsIFilePicker.modeOpen);
                        fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterAll);
                        if (fp.show() != nsIFilePicker.returnOK) //L'utilisateur annule
                          return;

                        var filePath = fp.file.path;

                        var data = FireGPG.Misc.EnigConvertToUnicode(FireGPG.Misc.getBinContent("file://" + filePath), 'UTF-8');

                        var whoWillGotTheMail = FireGPG.cGmail2.getToCcBccMail(this._doc,target.parentNode.parentNode.parentNode);

                        if (data == "")
                            return;

                        errors = false;

                        if (target.getAttribute('gpg_action') == "add_crypted") {

                            var result = FireGPG.Core.crypt(false,data,null, false, true,whoWillGotTheMail);

                            if(result.result != FireGPG.Const.Results.SUCCESS)
                                errors = true;

                        } else {

                            // We get the result
                            var result = FireGPG.Core.cryptAndSign(false, data, null ,false,null, null,true, whoWillGotTheMail);

                            if(result.result != FireGPG.Const.Results.SUCCESS)
                                errors = true;

                        }

                        if (errors == false){

                            var newData = result.encrypted;

                            var fileobj = FireGPG.Misc.getTmpDir();

                            fileobj.append( fp.file.leafName + ".asc");
                            fileobj.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

                            FireGPG.Misc.putIntoBinFile(fileobj.path,newData);


                            //We simulate the add
                            var tablebox = target.parentNode.parentNode.getElementsByTagName('table');
                            tablebox = tablebox[0];

                            //The last span is evry time a "Attach file" button.

                            //This is the 'Attach another'
                            var FileButtonList = tablebox.getElementsByTagName('span');
                            FileButton = FileButtonList[FileButtonList.length-1];

                            //If he is hidden, there no files for the moment. We take an another button
                            if (FileButton.parentNode.parentNode.parentNode.getAttribute("style").indexOf("display: none") != -1)
                            {

                                if (FileButtonList[FileButtonList.length-2].innerHTML == FileButtonList[FileButtonList.length-1].innerHTML)
                                    FileButton = FileButtonList[FileButtonList.length-2];
                                else
                                    FileButton = FileButtonList[FileButtonList.length-3];

                            }


                            var evt = doc.createEvent("MouseEvents");
                            evt.initEvent("click", true, true);
                            FileButton.dispatchEvent(evt);

                            //Get the list of inputs
                            var InputList = tablebox.getElementsByTagName('input');


                            for (var j = 0; j < InputList.length; j++) {

                                if (InputList[j].getAttribute("type") == "file") {
                                    if (InputList[j].value == "")
                                    {
                                        InputList[j].value = fileobj.path;
                                        break;
                                    }
                                }
                            }
                        }
                    } else  if (target.getAttribute('gpg_action') == "send_button" || target.getAttribute('gpg_action') == "send_button2") {



                        if (event.type == "keydown" && event.which != 13) {
                            return;
                        }

                        if (event.type == "keyup" && event.which == 13) {
                            event.stopPropagation();
                            return;
                        }

                        if (event.type == "keypress" && event.which == 13) {
                            event.stopPropagation();
                            return;
                        }

                        if (event.type == "keypress")
                            return;

                        if (event.type == "keyup" && event.which != 32) {
                            return;
                        }

                        stopTheEvent = false;

                        buttonsboxes = target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

                        tmpimage = buttonsboxes.getElementsByClassName('firegpg-sign', 'img');
                        sign = tmpimage[0].title == 'On';

                        tmpimage = buttonsboxes.getElementsByClassName('firegpg-encrypt', 'img');
                        encrypt = tmpimage[0].title == 'On';

                        tmpimage = buttonsboxes.getElementsByClassName('firegpg-inline', 'img');
                        inline = tmpimage[0].title == 'On';

                        tmpimage = buttonsboxes.getElementsByClassName('firegpg-attachements', 'img');
                        attachements = tmpimage[0].title == 'On';

                        if (!sign & !encrypt)
                            return;

                        if (target.getAttribute('gpg_action') == "send_button2")
                                buttonsboxes = target.parentNode.parentNode;
                            else
                                buttonsboxes = target.parentNode;

                        var whoWillGotTheMail = FireGPG.cGmail2.getToCcBccMail(this._doc,buttonsboxes, false, false, false);

                        if (inline) {

                            var mailContent = FireGPG.cGmail2.getWriteMailContent(this._doc,target.parentNode, true);



                            if (mailContent == "")
                                stopTheEvent = true;
                            else {

                                if (sign && encrypt) {

                                    var result = FireGPG.Core.cryptAndSign(false, mailContent, null ,false,null, null, false, whoWillGotTheMail);

                                    // If the sign failled
                                    if(result.result == FireGPG.Const.Results.ERROR_UNKNOW) {
                                        // We alert the user
                                        alert(i18n.getString("cryptAndSignFailed"));
                                        stopTheEvent = true;
                                    }
                                    else if(result.result == FireGPG.Const.Results.ERROR_PASSWORD) {
                                        // We alert the user
                                        alert(i18n.getString("cryptAndSignFailedPass"));
                                        stopTheEvent = true;
                                    }
                                    else if(result.result == FireGPG.Const.Results.SUCCESS)  {

                                        FireGPG.cGmail2.setWriteMailContent(this._doc,target.parentNode,result.encrypted);

                                    } else {
                                        stopTheEvent = true;
                                    }


                                } else if (sign) {

                                    var result = FireGPG.Core.sign(false,FireGPG.Misc.gmailWrapping(mailContent));

                                    if (result.result == FireGPG.Const.Results.SUCCESS) {

                                        FireGPG.cGmail2.setWriteMailContent(this._doc,target.parentNode,result.signed);

                                    } else {

                                        stopTheEvent = true;
                                    }

                                } else if (encrypt) {

                                    var result = FireGPG.Core.crypt(false,mailContent,null, false, false,whoWillGotTheMail);

                                    if(result.result == FireGPG.Const.Results.SUCCESS) {
                                        FireGPG.cGmail2.setWriteMailContent(this._doc,target.parentNode,result.encrypted);
                                    }  else {
                                        stopTheEvent = true;
                                    }

                                }

                                //
                                if (stopTheEvent == false) { //Faut faire notre propre event

                                    //On relance un click event
                                    event.stopPropagation();

                                    target.setAttribute('firegpg-ingore-this-event', 'firegpg-ingore-this-event');

                                    var evt1 = doc.createEvent("MouseEvents");
                                    evt1.initMouseEvent("mouseover", true, true, window,
                                    0, 0, 0, 0, 0, false, false, false, false, 0, null);

                                    var evt2 = doc.createEvent("MouseEvents");
                                    evt2.initMouseEvent("mousedown", true, true, window,
                                    0, 0, 0, 0, 0, false, false, false, false, 0, null);

                                    var evt3 = doc.createEvent("MouseEvents");
                                    evt3.initMouseEvent("mouseup", true, true, window,
                                    0, 0, 0, 0, 0, false, false, false, false, 0, null);

                                    target.dispatchEvent(evt1);
                                    target.dispatchEvent(evt2);
                                    target.dispatchEvent(evt3);

                                    target.setAttribute('firegpg-ingore-this-event', '');


                                }

                            }

                        } else {

                            //alert("S:" + sign + " E:" + encrypt + " I:" + inline);

                            form =  buttonsboxes.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByTagName('form');
                             f = form[0];

                            FireGPG.cGmail2.setProgressMessage(f, i18n.getString("GmailCreatingMail"));



                            var children = buttonsboxes.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('J-K-I-Jz');
                            a = new FireGPG.Mime.GmailMimeSender(f, children[2], i18n);


                            var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                                getService(Components.interfaces.nsIPrefService);

                            prefs = prefs.getBranch("extensions.firegpg.");
                            try {
                                var username = prefs.getCharPref("gmail_username");
                            } catch (e) {
                                username = "";
                            }


                            try {

                               var topwinjs = f.ownerDocument.defaultView.parent.wrappedJSObject;
                               if (("USER_EMAIL" in topwinjs) && typeof(topwinjs.USER_EMAIL) == "string")
                               {
                                   FireGPG.cGmail2.useremail = topwinjs.USER_EMAIL;
                               }
                               else if (("GLOBALS" in topwinjs) && typeof(topwinjs.GLOBALS[10]) == "string" &&
                                (/@(g|google)mail.com$/i).test(topwinjs.GLOBALS[10]))
                               {
                                   // gmail_fe_509_p10
                                   FireGPG.cGmail2.useremail = topwinjs.GLOBALS[10];
                               }
                               else if (typeof(topwinjs.globals) == "object" && typeof(topwinjs.globals.USER_EMAIL) == "string")
                               {
                                   FireGPG.cGmail2.useremail = topwinjs.globals.USER_EMAIL;
                               } else {

                                   FireGPG.cGmail2.useremail = f.ownerDocument.evaluate(".//div[@class='a8']//b[contains(text(), '@')]",
                                                                       f.ownerDocument.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE,
                                                                       null).singleNodeValue.textContent;

                               }

                           } catch (e) { FireGPG.debug(e, 'finding smtp username', true);}


                            if (username == "") {
                                 a.smtpUsername = FireGPG.cGmail2.useremail;
                            }

                            else
                                a.smtpUsername = username;


                            try {
                                  var no_auth = prefs.getBoolPref("gmail_smtp_no_auth",false);
                              } catch (e) {
                                  no_auth = false;
                              }

                            if (no_auth) {
                                a.smtpUsername = null;
                            }


                            try {
                                var host = prefs.getCharPref("gmail_host");
                            } catch (e) {
                                host = "smtp.gmail.com";
                            }

                            a.smtpServer = host;


                            try {
                                var port = prefs.getCharPref("gmail_port");
                            } catch (e) {
                                port = 465;
                            }


                            a.smtpPort = port;

                            try {
                                var use_ssl = prefs.getBoolPref("gmail_use_ssl",true);
                            } catch (e) {
                                use_ssl = true;
                            }

                            if (use_ssl)
                                a.smtpSocketTypes = new Array("ssl");

                            FireGPG.debug(a.smtpUsername, 'dbug-username');
                            FireGPG.debug(host, 'dbug-host');
                            FireGPG.debug(port, 'dbug-port');
                            FireGPG.debug(use_ssl, 'dbug-use_ssl');


                            from = FireGPG.cGmail2.getMailSender(this._doc,buttonsboxes);

                            if (from == "" || from == null)
                                from = FireGPG.cGmail2.useremail;



                            try {
                                var forcefrom = prefs.getCharPref("gmail_force_from");
                            } catch (e) {
                                forcefrom = "";
                            }

                            if (forcefrom != "" && forcefrom != null && forcefrom != undefined)
                                from = forcefrom;

                            if (from == undefined) //Zomg problem !
                                from = a.smtpUsername

                            if (from == undefined || from == "") {
                                event.stopPropagation();
                                alert('This shouldn\'t happend, but I\'m unable to find a from value. Please set one on options');
                                return;
                            }


                            to = FireGPG.cGmail2.getToCcBccMail(this._doc,buttonsboxes, true);
                            cc= FireGPG.cGmail2.getToCcBccMail(this._doc,buttonsboxes, false, true);
                            bcc = FireGPG.cGmail2.getToCcBccMail(this._doc,buttonsboxes,  false, false, true);

                            subject = FireGPG.cGmail2.getMailSubject(this._doc,buttonsboxes);


                            //Attachements

                            var attachments = new Array(), attlink;
                            // iterate over all Gmail form elements
                            //	var attachNumber = 0;
                            for (var i=0;i<f.elements.length;i++)
                            {
                                var elem = f.elements[i];
                                if (elem.type == "button" || elem.name == null ||
                                    elem.name.length == 0)
                                    continue;

                                if (elem.type == "file")
                                {
                                    // Add files to multipart encoder
                                    if (elem.value != null && elem.value.length) {
                                        attachments.push(elem.value);
                                    }
                                }
                                else if (elem.type == "checkbox" && elem.name == "attach" && elem.checked && elem.nextSibling && (attlink = elem.nextSibling.nextSibling) && (attlink instanceof HTMLAnchorElement))
                                {
                                    // this is an already-attached file, and the user wants it.
                                    var ioService=Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
                                    var channel=ioService.newChannel(attlink.href,null,null);
                                    attachments.push(channel);
                                }
                            } // end for

                            var mailContent = FireGPG.cGmail2.getWriteMailContentForDirectSend(this._doc, buttonsboxes);

                            var inreplyTo = f.getAttribute("firegpg-mail-id");


                             prefs = new Object();

                            prefs.sign = sign;
                            prefs.encrypt = encrypt;
                            prefs.attachements = attachements;
                            prefs.whoWillGotTheMail = whoWillGotTheMail;
                            prefs.whoSendTheMail = FireGPG.cGmail2.extractMails(from);

                            resulta = false;

                           resulta = a.ourSubmit(from, to, cc, bcc, subject,
                            inreplyTo, "", mailContent, FireGPG.cGmail2.iframeOrTextarea(this._doc, buttonsboxes) == "textarea", attachments, prefs);


                            //DBUG
                            FireGPG.debug(from, 'dbug-from');
                            FireGPG.debug(to, 'dbug-to');
                            FireGPG.debug(cc, 'dbug-cc');
                            FireGPG.debug(bcc, 'dbug-bcc');
                            FireGPG.debug(subject, 'dbug-subject');

                           if (!resulta)
                            FireGPG.cGmail2.setProgressMessage(f, i18n.getString("GmailErrorMail"));
                           else
                            FireGPG.cGmail2.setProgressMessage(f, i18n.getString("GmailSendingMail"));

                            stopTheEvent = true;

                        }




                        if (stopTheEvent) {
                            event.stopPropagation();
                            FireGPG.debug('Canceling event', 'click on send');
                        }


                    } else if (target.getAttribute('gpg_action') == "attachement" || target.getAttribute('gpg_action') == "sattachement" || target.getAttribute('gpg_action') == "sattachement2") {

                        if ( target.getAttribute('gpg_action') == "sattachement" )
                            node = target.parentNode.parentNode.parentNode.parentNode.parentNode;
                        if ( target.getAttribute('gpg_action') == "sattachement2" )
                            node = target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
                        if ( target.getAttribute('gpg_action') == "attachement" )
                            node = target;

                        name = node.getAttribute('firegpg-file-name');
                        type =  node.getAttribute('firegpg-file-type');

                        switch(type) {
                            case 'decrypted':
                                data = FireGPG.Misc.Base64.decode(node.getAttribute('firegpg-file-content'),true);

                                break;

                            case 'encrypted':
                                eData = FireGPG.Misc.Base64.decode(node.getAttribute('firegpg-file-content'),true);

                                var result = FireGPG.Core.decrypt(true,eData);

                                if (result.result == FireGPG.Const.Results.ERROR_NO_GPG_DATA) {

                                    var result = FireGPG.Core.decrypt(true,eData, undefined, true);

                                }

                                if (result.result == FireGPG.Const.Results.SUCCESS)
                                    data = result.decrypted;

                                if (result.notEncrypted)
                                    alert(i18n.getString("notEncryptedButPlainText"));

                                name = name.substring(0, name.length -4);

                                break;
                        }


                        if (data) {

                                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                                var fp = Components.classes["@mozilla.org/filepicker;1"]
                                    .createInstance(nsIFilePicker);

                                fp.init(window, null, nsIFilePicker.modeSave);
                                fp.appendFilters(nsIFilePicker.filterAll);
                                fp.defaultString = name;

                                var a = fp.show();

                                if (a != nsIFilePicker.returnOK && a != nsIFilePicker.returnReplace) //L'utilisateur annule
                                    return;

                                var filePath = fp.file.path;
                                //Need to remove the file before save
                                FireGPG.Misc.removeFile(filePath);
                                FireGPG.Misc.putIntoBinFile(filePath,data);

                        }




                    }

                } catch (e) {  FireGPG.cGmail2.error(e, 'callBack/call') }
            };
        } catch (e) {  FireGPG.cGmail2.error(e, 'callBack/main') }
	},

    /*
        Function: addBouton
        This function create a html button at the end of a node
        OR append a opton value on the select (who is created), if the user request for this.

        (DEPECIATED)

        Parameters:
            box - The node where the button is added.
            doc - The page's document (of the node)
            label - The label of the button
            action- The action of the button (for the callback)
            spamLimite -  The node before when we create the button.
    *//*
    addBouton: function(box,doc,label,action,spamLimite) {

        if ( ! this.b_use_select_s) {

            var bouton = new Object;
            bouton = null;
            bouton = doc.createElement("button");

            bouton.setAttribute("type","button");
            bouton.setAttribute("gpg_action",action);

            bouton.setAttribute("style","width: auto;");


            bouton.innerHTML = label;

            try {
                box.insertBefore(bouton,spamLimite);


            } catch (e) { FireGPG.debug(e,'cgmail2.addBouton',true);  }

        } else { //we have to use a select list.

            //We try to found a select who already exist.

            var selectlist = box.getElementsByTagName('select');

            if (selectlist[0])
                var select = selectlist[0];
            else {

                var select = new Object;
                select = null;
                select = doc.createElement("select");

                select.setAttribute("gpg_action","SELECT");

                select.setAttribute("style","font-size: 80%; margin-left: 5px; margin-bottom: 5px;");

                var option = new Option("FireGPG","FireGPG");

                select.add(option,null);

                try {
                    box.insertBefore(select,spamLimite);

                     var tmpListener = new Object;
                    tmpListener = null;
                    tmpListener = new FireGPG.cGmail2.callBack(doc)
                    select.addEventListener('onchange',tmpListener,true);

               } catch (e) { FireGPG.debug(e,'cgmail2.addBouton2',true);  }

            }

            //Now we add the option.
            var option = new Option("> " + label,action);

            select.add(option,null);

        }
	},*/

    /*
        Function: sendEmail
        Simulate a click on the send button.

        Parameters:
            nodeForScan - The node with the send button
            dDocument - The document of the page
    *//*DEPRECIATED
	sendEmail: function(nodeForScan, dDocument)
	{

		var children = nodeForScan.getElementsByTagName('button');


			try {
				var evt = dDocument.createEvent("MouseEvents");
					evt.initEvent("click", true, true);
					children[0].dispatchEvent(evt);
			 } catch (e) { FireGPG.debug(e,'cgmail2.sendEmail',true);  }

	},*/

    /*
        Function: getWriteMailContent
        Return the content of a mail in composition (his selection if something is selected)

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    getWriteMailContent: function(dDocument,boutonxboxnode, betterTextOnly, forMime)
	{
        try {
            if (betterTextOnly && FireGPG.cGmail2.iframeOrTextarea(dDocument,boutonxboxnode) == "iframe") {

                var i18n = document.getElementById("firegpg-strings");

                if (confirm(i18n.getString("betterToUsePlainText"))) {

                    whereSeacrch =boutonxboxnode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

                    children = whereSeacrch.getElementsByClassName('eo el', 'span');

                    try {
                        var evt = dDocument.createEvent("MouseEvents");
                            evt.initEvent("click", true, true);
                            children[0].dispatchEvent(evt);
                   } catch (e) { FireGPG.debug(e,'cgmail2.getWriteMailContent(settoplaintext)',true);  }

                }

            }

            if (FireGPG.cGmail2.iframeOrTextarea(dDocument,boutonxboxnode) == "iframe")
            {

                var iframe = FireGPG.cGmail2.getTheIframe(dDocument,boutonxboxnode);


                //First, we look for a selection
                try { var select = iframe.contentWindow.getSelection(); }
                catch (e) { var select = ""; }

                //Autodetect
                if (select.toString() == "")
                {
                    try { var select = iframe.contentWindow.document.body.innerHTML; }
                    catch (e) { var select = ""; }

                    if ( select != "")
                    {

                        if (FireGPG.cGmail2.noAutoReplyDetect) {

                            contenuMail =     FireGPG.Selection.wash(select);

                        } else {

                            var indexOfQuote = select.indexOf('<div class="gmail_quote">');

                            contenuMail = select.substring(0,indexOfQuote);

                            if (!forMime)
                                contenuMail =     FireGPG.Selection.wash(contenuMail);

                            if (indexOfQuote == -1 || FireGPG.Misc.TrimAndWash(contenuMail) == "")
                            {
                                indexOfQuote = select.length;
                                contenuMail = select.substring(0,indexOfQuote);

                                if (!forMime)
                                    contenuMail =     FireGPG.Selection.wash(contenuMail);

                            }

                            this.composeIndexOfQuote  = indexOfQuote;
                        }
                    }
                }
                else
                {
                    value = select.getRangeAt(0);


                    var documentFragment = value.cloneContents();

                    var s = new XMLSerializer();
                    var d = documentFragment;
                    var str = s.serializeToString(d);

                    contenuMail = FireGPG.Selection.wash(str);

                }


            } else {

                var textarea = FireGPG.cGmail2.getTheTextarea(dDocument,boutonxboxnode);

                var select2 = "";
                //Mode plain text

                //Selection
                try {
                    select2 = textarea.value;
                    select2 = select2.substring(textarea.selectionStart,textarea.selectionEnd);
                } catch (e) { }


                //Autodetect
                if (select2 == "")
                {



                    if (FireGPG.cGmail2.noAutoReplyDetect) {

                        contentu =  textarea.value;

                        textarea.selectionStart = 0;
                        textarea.selectionEnd = contentu.length;

                    } else {

                        select2 = textarea.value;

                        var indexOfQuote = select2.indexOf("\n> ");
                        select2 = select2.substring(0,indexOfQuote);

                        indexOfQuote = select2.lastIndexOf("\n");

                        var contentu = select2.substring(0,indexOfQuote);

                        if (indexOfQuote == -1 || FireGPG.Misc.TrimAndWash(contentu) == "")
                        {
                            select2 = textarea.value;
                            indexOfQuote = select2.length;

                            var contentu = select2.substring(0,indexOfQuote);
                        }

                        textarea.selectionStart = 0;
                        textarea.selectionEnd = indexOfQuote;

                    }

                    contenuMail = FireGPG.Selection.wash(contentu);
                }
                else
                {

                    contenuMail = FireGPG.Selection.wash(select2);
                }


            }

            //Remove stranges A0
            var reg=new RegExp(unescape('%A0'), "gi");
            contenuMail = contenuMail.replace(reg," ");


            return contenuMail;
        } catch (e) {  FireGPG.cGmail2.error(e, 'getWriteMailContent') }
	},


    /*
        Function: getWriteMailContentForDirectSend
        Return the content of a mail in composition (his selection if something is selected)

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    getWriteMailContentForDirectSend: function(dDocument,boutonxboxnode)
	{

        try {

            if (FireGPG.cGmail2.iframeOrTextarea(dDocument,boutonxboxnode) == "iframe")
            {

                var iframe = FireGPG.cGmail2.getTheIframe(dDocument,boutonxboxnode);

                texte = iframe.contentWindow.document.body.innerHTML;

                var reg=new RegExp("<script[^>]*>[^<]*</script[^>]*>", "gi"); //Élimination des scripts
                texte = texte.replace(reg,"\n");

                var reg=new RegExp("<script[^>]*>[^<]*</script>", "gi"); //Élimination des scripts
                texte = texte.replace(reg,"\n");

                var reg=new RegExp("<script>[^<]*</script>", "gi"); //Élimination des scripts
                texte = texte.replace(reg,"\n");

                return texte;


            } else {

                var textarea = FireGPG.cGmail2.getTheTextarea(dDocument,boutonxboxnode);

                return textarea.value.replace(/\r\n/gi, "\n").replace(/\r/gi, "\n").replace(/\n/gi, "\r\n");


            }
        } catch (e) {  FireGPG.cGmail2.error(e, 'getWriteMailContentForDirectSend') }
	},

    /*
        Function: iframeOrTextarea
        Return iframe if the iframe is used to compose the mail, textarea if not.

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    iframeOrTextarea: function(dDocument,boutonxboxnode) {

        try {
            var iframe = FireGPG.cGmail2.getTheIframe(dDocument,boutonxboxnode);
            var textarea = FireGPG.cGmail2.getTheTextarea(dDocument,boutonxboxnode);

            if (iframe == null || iframe.parentNode == undefined)
                return "textarea";

            if (textarea == null || textarea.parentNode == undefined)
                return "iframe";

            var style = iframe.parentNode.getAttribute('style');

            if (style.indexOf('display: none;') != -1)
                return "textarea";

            return "iframe";

        } catch (e) {  FireGPG.cGmail2.error(e, 'getiframeOrTextarea') }

    },

    /*
        Function: getTheIframe
        Return the iframe used to compose a mail

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    getTheIframe: function(dDocument,boutonxboxnode) {


        try {


            var i = dDocument.evaluate(".//td[contains(@class, 'Ap')]//iframe", boutonxboxnode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            FireGPG.debug(i, 'iframefound');

            return i;


        } catch (e) {  FireGPG.cGmail2.error(e, 'getTheIframe') }


    },

    /*
        Function: getTheTextarea
        Return the textarea used to compose a mail

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    getTheTextarea: function(dDocument,boutonxboxnode) {

        try {

            var i = dDocument.evaluate(".//td[contains(@class, 'Ap')]//textarea", boutonxboxnode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            FireGPG.debug(i, 'textareadfound');

            return i;


        } catch (e) {  FireGPG.cGmail2.error(e, 'getTextarea') }
    },

    /*
        Function: getToCcBccMail
        Return the To, CC and BCC filds' value of a mail in composition.

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
	getToCcBccMail: function(dDocument,boutonxboxnode, onlyto, onlycc, onlybcc) {
		try {

            var forWho = "";
            var tmpFor = "";

            var tmp = boutonxboxnode;

          /*  tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];

             //29 septebmre 2008
            if (!tmp) {

                 var tmp = boutonxboxnode;

                tmp = tmp.parentNode;

                tmp = tmp.parentNode;

                tmp = tmp.parentNode;

                tmp = tmp.childNodes[1];

            }

             if (!tmp) { //Version du 29 octobre 2008 - BOUTONS DU HAUT

                var tmp = boutonxboxnode;

                tmp = tmp.parentNode;

                tmp = tmp.parentNode;

                tmp = tmp.parentNode;

                tmp = tmp.parentNode;

                tmp = tmp.childNodes[1];


            }

            tmp = tmp.firstChild; */

             var tmp = dDocument.evaluate(".//table[contains(@class, 'cf eA')]/tbody", tmp.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;


            var textareas = tmp .getElementsByTagName("textarea");


            //On cherche la boite avec les boutons
            for (var j = 0; j < textareas.length; j++) {
                if (textareas[j].getAttribute("name") == "to" || textareas[j].getAttribute("name") == "cc" || textareas[j].getAttribute("name") == "bcc") {

                    forWho = forWho + " " + textareas[j].value;

                    if (onlyto && textareas[j].getAttribute("name") == "to")
                        return  textareas[j].value;

                    if (onlycc && textareas[j].getAttribute("name") == "cc")
                        return  textareas[j].value;

                    if (onlybcc && textareas[j].getAttribute("name") == "bcc")
                        return  textareas[j].value;



                }
            }




            return FireGPG.cGmail2.extractMails(forWho);

        } catch (e) {  FireGPG.cGmail2.error(e, 'getToCCbcc') }
	},

    extractMails: function(forWho) {
        try {
        	//Pattern
            var reg = new RegExp('[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}', 'gi');

            var aMail = reg.exec(forWho);

            var i = 0;
            var returnList = new Array();

            while(aMail != null)
            {
                returnList[i] = aMail;
                i++;
                aMail = reg.exec(forWho);
            }

            return returnList;
        } catch (e) {  FireGPG.cGmail2.error(e, 'ExtractMail') }

    },

    /*
    */

    getMailSender: function(dDocument,boutonxboxnode) {

        try {

            var tmp = boutonxboxnode;

            var tmp = dDocument.evaluate(".//table[contains(@class, 'cf eA')]/tbody", tmp.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            var selects = tmp .getElementsByTagName("select");


            //On cherche la boite avec les boutons
            for (var j = 0; j < selects.length; j++) {
                if (selects[j].getAttribute("name") == "from") {

                    return selects[j].value;

                }
            }


            //Peut être en
            var selects = tmp .getElementsByClassName("ef");

            if (selects && selects[0])
                return selects[0].innerHTML.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');

            return "";


        } catch (e) {  FireGPG.cGmail2.error(e, 'getMailSender') }


    },

    getMailSubject: function(dDocument,boutonxboxnode) {

        try {
            var tmp = boutonxboxnode;

            var tmp = dDocument.evaluate(".//table[contains(@class, 'cf eA')]/tbody", tmp.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            var inputs  = tmp .getElementsByTagName("input");


            //On cherche la boite avec les boutons
            for (var j = 0; j < inputs.length; j++) {
                if (inputs[j].getAttribute("name") == "subject") {

                    return inputs[j].value;

                }
            }

            return "";

        } catch (e) {  FireGPG.cGmail2.error(e, 'getMailSubject') }

    },


    /*
        Function: setWriteMailContent
        Set the content of a mail in composition (his selection if something is selected)

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
            newText - The new text
    */
	setWriteMailContent: function(dDocument,boutonxboxnode,newText)
	{

        try {
            if (FireGPG.cGmail2.iframeOrTextarea(dDocument,boutonxboxnode) == "iframe")
            {

                var iframe = FireGPG.cGmail2.getTheIframe(dDocument,boutonxboxnode);


                //First, we look for a selection
                try { var select = iframe.contentWindow.getSelection(); }
                catch (e) { var select = ""; }

                //Autodetect
                if (select.toString() == "")
                {
                    try { var select = iframe.contentWindow.document.body.innerHTML; }
                        catch (e) { var select = ""; }

                    var reg=new RegExp("<", "gi");
                    newText = newText.replace(reg,"&lt;");

                    var reg=new RegExp("\n", "gi");
                    newText = newText.replace(reg,"<br>");

                    if (FireGPG.cGmail2.noAutoReplyDetect)
                        this.composeIndexOfQuote = select.length;

                    iframe.contentWindow.document.body.innerHTML = newText + select.substring(this.composeIndexOfQuote, select.length) + "<br /><br />";
                }
                else
                {
                    var reg=new RegExp("<", "gi");
                    newText = newText.replace(reg,"&lt;");

                    var reg=new RegExp("\n", "gi");
                    newText = newText.replace(reg,"<br>");

                    var range = select.getRangeAt(0);
                    var el = iframe.contentWindow.document.createElement("div");

                    el.innerHTML = newText;

                    range.deleteContents();
                    range.insertNode(el);

                }


            } else {

                var textarea = FireGPG.cGmail2.getTheTextarea(dDocument,boutonxboxnode);

                var startPos = textarea.selectionStart;
                var endPos = textarea.selectionEnd;
                var chaine = textarea.value;

                // We create the new string and replace it into the focused element
                textarea.value = chaine.substring(0, startPos) + newText + chaine.substring(endPos, chaine.length);

                // We select the new text.
                textarea.selectionStart = startPos;
                textarea.selectionEnd = startPos + newText.length ;

            }
        } catch (e) {  FireGPG.cGmail2.error(e, 'setWriteMailContent') }

	},


    /*
        Function: getMailContent
        Retrun the content of a mail, need the div object with the mail

        Parameters:
            i - The mail node
            doc - The document of the page.
    */
	getMailContent: function(i,doc) {

        try {
            var contenuMail = i;
            var range = doc.createRange();
            range.selectNode(contenuMail);
            var documentFragment = range.cloneContents();
            var s = new XMLSerializer();
            var d = documentFragment;
            var str = s.serializeToString(d);
            contenuMail = FireGPG.Selection.wash(str);


            //Remove stranges A0
            var reg=new RegExp(unescape('%A0'), "gi");
            contenuMail = contenuMail.replace(reg," ");

            return contenuMail;

        } catch (e) {  FireGPG.cGmail2.error(e, 'getMailContent') }

	},

        /*
        Function: setMailContent
        Set the content of a mail, need the div object with the mail

        Parameters:
            i - The mail node
            doc - The document of the page.
            data - The html of the mail
    */
	setMailContent: function(papai,doc,data) {

        try {

            var i = papai.getElementsByClassName("ii gt");
            i = i[0];

            var baseData = i.innerHTML;

            FireGPG.debug(baseData);

            var before = baseData.substring(0,baseData.indexOf("-----BEGIN PGP MESSAGE-----"));

            var end = baseData.indexOf("-----END PGP MESSAGE-----") + "-----END PGP MESSAGE-----".length;

            if (end ==( "-----END PGP MESSAGE-----".length -1))
                end = baseData.indexOf('<a class="vem"');

            var after = baseData.substring(end, baseData.length);


            var img = "<img src=\""+FireGPG.Const.Gmail2.IMG_ENCRYPTED+"\" alt=\"" +FireGPG.Const.Gmail2.IMG_ENCRYPTED2+"\" onmouseout=\"a = this.alt; this.alt=this.src; this.src=a; this.title = ''; \" onmouseover=\"if (this.title == '') { a = this.alt; this.alt=this.src; this.src=a; this.title = 'FireGPG'; }\">";

            data = data.replace(/(.{1,70})(?:\s|$)/g,"$1<br/>")

            data = data.replace(/<br \/>/gi, '<br/>');
            data = data.replace(/ /gi, '&nbsp;');

            i.innerHTML = before + img + "<br /><br />" + data + "<br />" + img  +  after;

        } catch (e) {  FireGPG.cGmail2.error(e, 'setMailContent') }

	},

    /*//On détruit tous les documents.
    listenerUnload: function () {



    },*/

    /*
        Function: initSystem
        This function init the class : she load specific options, and attach listeners to the webpages.
    */
    initSystem: function() {

        return false; // Gmail turned off.

		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		                        getService(Components.interfaces.nsIPrefService);
		prefs = prefs.getBranch("extensions.firegpg.");

		try {
			var usegmail = prefs.getBoolPref("gmail_enabled");
		}
		catch (e) {
			var usegmail = false;
		}

		if (usegmail == true) {

            if (document.getElementById("appcontent"))
                document.getElementById("appcontent").addEventListener("DOMContentLoaded", FireGPG.cGmail2.pageLoaded, false);
            else
                document.getElementById("browser_content").addEventListener("DOMContentLoaded", FireGPG.cGmail2.pageLoaded, false);
			//window.addEventListener("unload", function() {FireGPG.cGmail2.listenerUnload()}, false);

	try {	var nonosign = prefs.getBoolPref("gmail_no_sign_off");	}
			catch (e) { var nonosign = false; }
			/*		try {	var b_sign = prefs.getBoolPref("gmail_butons_sign");	}
			catch (e) { var b_sign = true; }
			try {	var b_sign_s = prefs.getBoolPref("gmail_butons_sign_send");	}
			catch (e) { var b_sign_s = true; }
            try {	var b_psign = prefs.getBoolPref("gmail_butons_psign");	}
            catch (e) { var b_psign = true; }
			try {	var b_psign_s = prefs.getBoolPref("gmail_butons_psign_send");	}
			catch (e) { var b_psign_s = true; }
			try {	var b_crypt = prefs.getBoolPref("gmail_butons_crypt");	}
			catch (e) { var b_crypt = true; }
			try {	var b_crypt_s = prefs.getBoolPref("gmail_butons_crypt_send");	}
			catch (e) { var b_crypt_s = true; }

			try {	var b_signcrypt = prefs.getBoolPref("gmail_butons_sign_crypt");	}
			catch (e) { var b_signcrypt = true; }

            try {	var b_signcrypt_s = prefs.getBoolPref("gmail_butons_sign_crypt_send");	}
			catch (e) { var b_signcrypt_s = true; }

            try {	var b_use_select_s = prefs.getBoolPref("gmail_butons_use_select");	}
			catch (e) { var b_use_select_s = false; }


			FireGPG.cGmail2.b_sign = b_sign;
			FireGPG.cGmail2.b_sign_s = b_sign_s;
            FireGPG.cGmail2.b_psign = b_psign;
			FireGPG.cGmail2.b_psign_s = b_psign_s;
			FireGPG.cGmail2.b_crypt = b_crypt;
			FireGPG.cGmail2.b_crypt_s = b_crypt_s;
			FireGPG.cGmail2.b_signcrypt = b_signcrypt;
			FireGPG.cGmail2.b_signcrypt_s = b_signcrypt_s;
            FireGPG.cGmail2.b_use_select_s = b_use_select_s; */

            FireGPG.cGmail2.nonosign = nonosign;

            try {	var default_sign = prefs.getBoolPref("gmail_select_by_default_sign");	}
			catch (e) { var default_sign = false; }

            try {	var default_encrypt = prefs.getBoolPref("gmail_select_by_default_encrypt");	}
			catch (e) { var default_encrypt = false; }

            try {	var default_inline = prefs.getBoolPref("gmail_select_by_default_inline");	}
			catch (e) { var default_inline = false; }

            try {	var default_attachements = prefs.getBoolPref("gmail_select_by_default_attachements");	}
			catch (e) { var default_attachements = false; }

            FireGPG.cGmail2.default_sign = default_sign;
			FireGPG.cGmail2.default_encrypt = default_encrypt;
			FireGPG.cGmail2.default_inline = default_inline;
            FireGPG.cGmail2.default_attachements = default_attachements;


            try {	var noAutoDecrypt = prefs.getBoolPref("gmail_disable_auto_decryption");	}
			catch (e) { var noAutoDecrypt = false; }
            FireGPG.cGmail2.noAutoDecrypt = noAutoDecrypt;

            try {	var noAutoReplyDetect = prefs.getBoolPref("gmail_disable_detection_of_reply_for_signs");	}
			catch (e) { var noAutoReplyDetect = false; }
            FireGPG.cGmail2.noAutoReplyDetect = noAutoReplyDetect;

            try {	var decryptOnReply = prefs.getBoolPref("gmail_decrypt_when_reply");	}
			catch (e) { var decryptOnReply = false; }
            FireGPG.cGmail2.decryptOnReply = decryptOnReply;

            try {	var showUserInfo = prefs.getBoolPref("gmail_show_user_info_for_signs");	}
			catch (e) { var showUserInfo = false; }
            FireGPG.cGmail2.showUserInfo = showUserInfo;

            try {	var encryptIfDecrypted = prefs.getBoolPref("gmail_keep_encrypted_mail");	}
			catch (e) { var encryptIfDecrypted = false; }
            FireGPG.cGmail2.encryptIfDecrypted = encryptIfDecrypted;




		}
	},


    /*
        Function: pageLoaded
        This function is called when a page is loaded. If it's seem to be a gmail page, listeners are added.

        Parameters:
            aEvent - The event of the load
    */
    pageLoaded: function(aEvent) {

        var doc = aEvent.originalTarget;



        var final_location = doc.location.href;

        var regrex = new RegExp('^https?://mail.google.com/a/[a-zA-Z-.0-9]*');

        final_location = final_location.replace(regrex, "http://mail.google.com/mail");

        FireGPG.debug(final_location);

        //Find IK
        if (final_location.indexOf("http://mail.google.com/mail/?ui=2&ik=") == 0 || final_location.indexOf("https://mail.google.com/mail/?ui=2&ik=") == 0) {

            var tmp_string = final_location.substring(final_location.indexOf("&ik=") + 4, final_location.length);
            var ik = tmp_string.substring(0, tmp_string.indexOf('&'));

            FireGPG.cGmail2.ik = ik;

            FireGPG.debug("ik:" + ik);

        }

        //Fing base url
        if ((final_location.indexOf("http://mail.google.com/mail/?ui=2") == 0 || final_location.indexOf("https://mail.google.com/mail/?ui=2") == 0)) {

            FireGPG.cGmail2.baseUrl = doc.location.href.substring(0, doc.location.href.indexOf("?ui=2"));
FireGPG.debug("baseurl:" + FireGPG.cGmail2.baseUrl);
        }

        //Add windowopen rewriter
        if (final_location.indexOf("http://mail.google.com/mail/") == 0 || final_location.indexOf("https://mail.google.com/mail/") == 0) {

            var sr = doc.createElement('script');
            sr.innerHTML = "var windowopen_ = window.open; window.open = function (a,b,c) {  if (document.getElementById('canvas_frame') && document.getElementById('canvas_frame').contentDocument && document.getElementById('canvas_frame').contentDocument.body && document.getElementById('canvas_frame').contentDocument.body.getAttribute('firegpg') != null &&document.getElementById('canvas_frame').contentDocument.body.getAttribute('firegpg').indexOf('#FIREGPGCAPTURE') != -1) { document.getElementById('canvas_frame').contentDocument.body.setAttribute('firegpg',a); return new Window();  } else { return windowopen_(a,b,c); }};"
            FireGPG.debug("try to add");
            if (doc) {
                doc.body.appendChild(sr);
                FireGPG.debug("added");
            }



        }





        //http://mail.google.com/mail/?ui=2&ik=8e7a8837c3&

        if (final_location.indexOf(FireGPG.Const.Gmail2.GMAIL_MAIN_DOC_URL) == 0 || final_location .indexOf(FireGPG.Const.Gmail2.GMAIL_MAIN_DOC_URL2) == 0) {
FireGPG.debug("activated");

            doc.getElementsByClassName = function(className, tag) {

            if (tag == undefined)
                tag = "*"

            className = " " + className + " "

            var elts =  doc.getElementsByTagName(tag);

            var classArray = new Array();

            for (var j = 0; j < elts.length; ++j) {

                var lf = "  " + elts[j].className + " "

                if (lf.indexOf(className) > 0) {

                        classArray.push(elts[j]);
                    }
                }

                return classArray;

            };




            FireGPG.cGmail2.current = FireGPG.cGmail2.current + 1;

            FireGPG.cGmail2.doc[FireGPG.cGmail2.current] = doc;

            /*var tmpListener = new Object;
            tmpListener = null;
            tmpListener = new FireGPG.cGmail2.clickOnDock(FireGPG.cGmail2.current)
            doc.addEventListener('mousedown',tmpListener,true);*/

            var tmpListener = new Object;
            tmpListener = null;
            tmpListener = new FireGPG.cGmail2.whenNodeIsInsered(FireGPG.cGmail2.current)
            doc.addEventListener('DOMNodeInserted',tmpListener,true);



            //setTimeout("FireGPG.cGmail2.checkDoc("+FireGPG.cGmail2.current+")", 5000);

        }

    },

        /*
        Function: clickOnDock
        This function is called when the user click on the page. She will call <checkDoc> 5s later.

        Parameters:
            docid - The document 's id of the click.
    */
    clickOnDock: function(docid) {

        this._docid = docid;

        //
        this.handleEvent = function(event) {

            if (FireGPG.cGmail2.docOccuped[this._docid] == undefined || FireGPG.cGmail2.docOccuped[this._docid] == false)
            {

                setTimeout("FireGPG.cGmail2.checkDoc("+this._docid+")", 5000);
                FireGPG.cGmail2.docOccuped[this._docid] = true;
            }


        }


    },

    whenNodeIsInsered: function(docid) {

        this._docid = docid;

        //
        this.handleEvent = function(event) {

          FireGPG.debug(event.target.className, 'Nodeinsersed');

            if (event.target && event.target.className &&
                (event.target.className == "HprMsc" || event.target.className.indexOf("y4Wv6d") != -1 || event.target.className == "XoqCub" ||//load old mail | compose | Mail widnow
                 event.target.className.indexOf("HprMsc") != -1 || event.target.className.indexOf("CoUvaf") != -1 || event.target.className.indexOf("T1HY1") != -1  || event.target.className.indexOf("cf hX") != -1 || event.target.className.indexOf("Bs nH iY") != -1) &&  //load old mail2 | compose2 | Mail widnow2 | bouton d'un mail
                (FireGPG.cGmail2.docOccuped[this._docid] == undefined || FireGPG.cGmail2.docOccuped[this._docid] == false))
            {
                FireGPG.debug("Captured !");

                FireGPG.cGmail2.docOccuped[this._docid] = true;
                setTimeout("FireGPG.cGmail2.checkDoc("+this._docid+")",1000);


            }


        }


    },

     /*
        Function: getMimeMailContens
        Return the mime source of a mail

        Parameters:
            id - The mail's id
    */
	getMimeMailContens: function(id,doc) {

        try {

            FireGPG.debug('Starting get content', 'getMimeMailContens');

            var elements = id.parentNode.parentNode.parentNode.parentNode.firstChild.getElementsByTagName("img");

            var actionbox = "";

            //On cherche la boite avec les boutons
            for (var j = 0; j < elements.length; j++) {
                if (elements[j].getAttribute("class") == "hA" && elements[j].getAttribute("alt") == "") {
                    actionbox = elements[j].parentNode;
                    //break;
                }
            }//

            FireGPG.debug('Actionbox is ' + actionbox, 'getMimeMailContens');



             //This is a ugly hack.

              var evt = doc.createEvent("MouseEvents");
             evt.initMouseEvent("click", true, true, window,
               0, 0, 0, 0, 0, false, false, false, false, 0, null);

            var scollage = doc.documentElement.scrollTop;
            var a = actionbox.dispatchEvent(evt);
            doc.documentElement.scrollTop = scollage;

            FireGPG.debug('Event dispatech (click) is ' + a, 'getMimeMailContens');

          //  return '';
           //On choppe le bouton en question
           //CHILDREN OF gv
           // act="32"

            var papa = doc.getElementsByClassName('hx');
            papa = papa[0];

            FireGPG.debug('Papa is ' + papa, 'getMimeMailContens');

            detailsElement = null;

           /* for (var j = 0; j < papa.childNodes.length; j++) {

                FireGPG.debug(papa.childNodes[j].getAttribute("act"));

                if (papa.childNodes[j].getAttribute("act") == "32") {
                    detailsElement = papa.childNodes[j];
                    break;
                }
            }*/

            var detailsElement = doc.evaluate(".//div[@act='32']", papa, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            if (detailsElement == null) {
                FireGPG.debug('Holy cow, no detailsElement !!!', 'getMimeMailContens',true);
                return '';
            }

            FireGPG.debug('detailsElement is ' + detailsElement, 'getMimeMailContens');
            doc.body.setAttribute('firegpg',"#FIREGPGCAPTURE");

            var evt3 = doc.createEvent("MouseEvents");
             evt3.initMouseEvent("mousedown", true, true, window,
               1, 0, 0, 0, 0, false, false, false, false, 0, null);

             var scollage = doc.documentElement.scrollTop;
             detailsElement.dispatchEvent(evt3);
             doc.documentElement.scrollTop = scollage;


             var evt3 = doc.createEvent("MouseEvents");
             evt3.initMouseEvent("mouseup", true, true, window,
               1, 0, 0, 0, 0, false, false, false, false, 0, null);

             var scollage = doc.documentElement.scrollTop;
             detailsElement.dispatchEvent(evt3);
             doc.documentElement.scrollTop = scollage;

            var evt3 = doc.createEvent("MouseEvents");
             evt3.initMouseEvent("click", true, true, window,
               1, 0, 0, 0, 0, false, false, false, false, 0, null);

             var scollage = doc.documentElement.scrollTop;
             detailsElement.dispatchEvent(evt3);
             doc.documentElement.scrollTop = scollage;

            var url = doc.body.getAttribute('firegpg');

            FireGPG.debug('Url get is ' + url, 'getMimeMailContens');

            if (url == "#FIREGPGCAPTURE" ) {
                //Close popup
                var evt4 = doc.createEvent("MouseEvents");
                evt4.initMouseEvent("mousedown", true, true, window,
                 0, 0, 0, 0, 0, false, false, false, false, 0, null);

                var scollage = doc.documentElement.scrollTop;
                actionbox.dispatchEvent(evt4);
                doc.documentElement.scrollTop = scollage;

                FireGPG.debug('Waiting mode', 'getMimeMailContens');
                return "{ERROR,WAIT}";

            }

            doc.body.setAttribute('firegpg',"");

            FireGPG.debug('baseUrl is ' + FireGPG.cGmail2.baseUrl, 'getMimeMailContens');

            if (this.messageCache == null || this.messageCache[url] == null)
            {
                //FireGPG.Misc.getContentXHttp
                var data = FireGPG.Misc.getBinContent(FireGPG.cGmail2.baseUrl + url , 5000*1024);

         //       FireGPG.debug('data1 is ' + data, 'getMimeMailContens');

                if (data == "{MAX}") {

                    var i18n = document.getElementById("firegpg-strings");

                    if (confirm(i18n.getString("GmailBigMail")))
                        data = FireGPG.Misc.getBinContent(FireGPG.cGmail2.baseUrl + url );
                    else
                        return '';

           //         FireGPG.debug('data2 is ' + data, 'getMimeMailContens');

                }

          //      FireGPG.debug('finaldata is ' + data, 'getMimeMailContens');


                var mailData = FireGPG.Misc.EnigConvertToUnicode(data , 'UTF-8');

            //    FireGPG.debug('mailData is ' + mailData, 'getMimeMailContens');
                // FireGPG.Misc.getContentXHttp(FireGPG.cGmail2.baseUrl + url);

                if (this.messageCache == null)
                    this.messageCache = { };

                //this.messageCache[url ] = mailData;

                return mailData;
            }
            else
            {
                return this.messageCache[url ];
            }
        } catch (e) {  FireGPG.cGmail2.error(e, 'getMimeMailContent') }

    },


    setProgressMessage: function(form, text) {
        try
        {
            // already closed (this also means that local variables like jsdump are probably unavailable)
            if (!form.ownerDocument.defaultView) return;
            // all that's needed is the form...we can go from there
            var t = form.ownerDocument.defaultView.top;
            var d = t.document;
            const F = XPathResult.FIRST_ORDERED_NODE_TYPE;

            var jH = d.evaluate("div[contains(@class, 'vY')]", d.body, null, F, null).singleNodeValue;
            // used to have div[@class='jHZvnc'] but should be div[contains(@class, 'jHZvnc')], so moved around
            var IY	= d.evaluate(".//div[@class='no']", jH, null, F, null).singleNodeValue;
            var wT	= d.evaluate("div/div[contains(@class,'nH vX')]",IY, null, F, null).singleNodeValue;
            if (!wT) wT = d.evaluate("div/div[contains(@class,'QShok')]", IY, null, F, null).singleNodeValue;
            if (text == null)
            {
                wT.parentNode.style.display = "none";
                return;
            }

            wT.parentNode.style.display = "";
            FireGPG.Mime.stUtil.removeClassName(jH, "nq");

            // <div class="IY0d9c"><div class="XoqCub EGSDee" style="width: 66px;"><div class="SsbSQb L4XNt"><span class="hdgibf">Loading...</span></div></div><div class="XoqCub EGSDee" style="width: 0px;"/></div>
            var hd	= d.evaluate(".//span[@class='v1']", wT, null, F, null).singleNodeValue;
            if (!hd)
            {
                // does not exist yet; this is the first time.
                var EGSDee = d.evaluate(".//div[@class='no']/div[contains(@class, 'nH nn') and position()=1]", wT, null, F, null).singleNodeValue;
                hd = d.createElement("span");
                hd.className = "v1";
                var SsbSQb_L4XNt = d.createElement("div");
                SsbSQb_L4XNt.className = "vZ v3";
                SsbSQb_L4XNt.appendChild(hd);
                EGSDee.appendChild(SsbSQb_L4XNt);
            }
            hd.innerHTML = text;
            wT.parentNode.style.display = ""; // need to enable to get the right sizes
            var ow = hd.offsetWidth; // original width
            var u;	// temporary variable
            ow += 2;
            (u = hd.parentNode.parentNode).style.width = ow + "px";
            u.parentNode.parentNode.style.width = ow + "px";

            ow += 8;
            var owp = ow + "px";
            wT.parentNode.style.width = owp;
            wT.style.width = owp;
            wT.firstChild.style.width = owp;

            // now deal with equidistant sizing
            wT.parentNode.previousSibling.style.width = wT.parentNode.nextSibling.style.width = Math.floor((IY.parentNode.offsetWidth - ow)/2).toString() + "px";
        }
        catch (e)
        {
            FireGPG.cGmail2.error(e, 'setProgressMessage')
        }
    }, // end setProgressMessage

    error: function(error, where) {

         var i18n = document.getElementById("firegpg-strings");

        if (!getBrowser().contentWindow.document.getElementById('firegpg-gmail-error')) {
            try {
                        div = getBrowser().contentWindow.document.createElement('div');
                        div.setAttribute('id', 'firegpg-gmail-error');
                        div.setAttribute('title', i18n.getString('gmail_problem_message'));
                        div.setAttribute('style', "z-index: 10000; position: absolute; bottom: 0px; right: 0px; width: auto; height: auto; border: 1px red solid; background-color: #ff9999; font-size: 70%; text-align: center;");
                        div.innerHTML = '<b>FireGPG</b>: ' + i18n.getString('gmail_problem_title') + ' <a href="#" onclick="alert(document.getElementById(\'firegpg-gmail-error\').title);">' + i18n.getString('gmail_problem_detail') + '</a> <a href="http://getfiregpg.org/s/gmailstatut" target="_blank">' + i18n.getString('gmail_problem_status') + '</a> <a href="#" onclick="document.getElementById(\'firegpg-gmail-error\').style.display = \'none\'; ">' + i18n.getString('gmail_problem_close') + '</a>';
                        getBrowser().contentWindow.document.body.appendChild(div);
            } catch (e) { alert(e.lineNumber + e); }
        }

        getBrowser().contentWindow.document.getElementById('firegpg-gmail-error').title +=  '\n\n' + FireGPG.Misc.htmlEncode(where + ' ' + error.fileName + ' ' + error.lineNumber + ' ' + error.message)  ;


        FireGPG.debug(error, "cGmail2/error/" + where, true);

    }

};
