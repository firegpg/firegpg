/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is FireGPG.
 *
 * The Initial Developer of the Original Code is
 * FireGPG Team.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/* Constant: GMAIL_MAIN_DOC_URL
 The url of the mail document for gmail */
const GMAIL_MAIN_DOC_URL = "http://mail.google.com/mail/?ui=2&view=bsp&ver=";
/* Constant: GMAIL_MAIN_DOC_URL2
 The url of the mail document for gmail and https. */
const GMAIL_MAIN_DOC_URL2 = "https://mail.google.com/mail/?ui=2&view=bsp&ver=";


//Pictures
const IMG_SIGN_ON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB9kBDxIAOdxBIbcAAAI+SURBVDjLxZO7TxRhFMV/M/PN7EPYhS02yytggo+ERAgxERsNhYnGzsQojaHT3r9F0cTaUjs6NUQLBRKDi4I8FEwkLMgO+5rdeX3XAoVYiZWnP797cu69Bv8gqZ+0QTqIdRpl1VHGvnV884CJwQgwicVtoB/ku/H4ycOnURgP/Q1g21Fw4+r0RjbbNmaq4ayO35UkXp9S2UzHxK2bE4QNl82FVwD0D49jn+hERBCRgwTiIX7pvGUGYF/BlO327d3ENfV7wuL0AyjPICIsfPvAmev3qdVqlMtlCoUCGxurDPT1kEnPomQKkRTFpXOjh4DN4kvGLuSJ/JC38y/ouXyXYrGIiBDHMVtbu1SrvXTlbfp6HcQcoVwp5hRAaWedPXFYfL+E1lAKswSRy+joKEEQICLkcjm01hiGgRcksW0b4SMKYHb+OSt6ma+VffxWRF3S5OeeMX7pHkqpwy5EBK31H90ogFODF1lbm8OtlEhloDORpbdnhDAMaTabhwbbtkkkEkRRhGVZR4BCfojJO4+o1VwQAItEIolpmliWRVtbG7s/dlDKotGo47U8CvkuAEwA3/eJoxhE0WyGuO4+nucRBAHVahXDMKg3agRhQBAGVKsVtNZHCRzHwTAMcrnc0eX9it3e3g7A6cGzhx0AKHWwQOV5jdXXb2ZOaa3BOP5ffF5ZptVqflG+3xpbWv5kh2FolEo7dnmv7Lium6zXG0nf95MiguM4QTqd9jPZTCvX2eF393QHqVRKZ7KZkP+unzPGLX8Jr7F8AAAAAElFTkSuQmCC";
const IMG_SIGN_OFF = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAXNSR0IArs4c6QAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH2QEVCjAYYv9CKQAAARxJREFUKM+V0TtuU1EAhOHvnHv8iiABS4Ah0AFVKGADdGwAiQ2wKSR2Qk0BEg0yTQRFiiQoErGDc/HrPg6FQ4NMwbTzz0wxwVZ9j/ptp1gXy2KrHcLI03jghsvw9mV162+g0zy/2Lvf66/K6lPaPXhlbowndmQZrdm9qK8Znj9M8M5EduyFSxMjR0a6Gny7G+GLfbeNlcaOnTh16FSrUA4SZ2qftZYqz6xlQ61wNRf5qHTiyLkPgiRJOuIVkHjsqwv0PVBZyLKOnlqxAUZem4GeqHDND8kvC3c2Eys1Fqbm1maCUqUy024auoIhyLLreCT/MaX55P2w3X6IQ8tpeDP4GatwFifFNJVplbJus9Ps1jfr/WaQ9/6V/Q/9BlpZbcoZhMEjAAAAAElFTkSuQmCC";

const IMG_ENCRYPT_ON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEgAACxIB0t1+/AAAAAd0SU1FB9kBDxIAMKWdmRMAAAJ7SURBVDjLfZJNSFRRFMd/zvfo6Dj4ManJBEmCUggqQ5BQkLV3KUTrWrhqCIRwE7aZnW6CICjCRatcWNDKjdYiNPA7lCFNZ4Zx3jjP9+687xbTjFOSZ3XuPf//71zOuXX8E9PTbyNtbeGHra3Nj5qa6q8ByLKaymalmVyu+Hpy8oFUq3fXHqamXrWEw6FEPN7/bGioNxqLtdPV1UJ3d3tzIOC7nU7n3fH4/dXFxXlxDpBIzLjq6wNjIyM3pnp7uxt2d/eN5eW1wtZWSlVVxd3Tc9nv83mup1LpH8PDo2tLSx8dAE8FoOtGQzQaGY/FouHNzT1tYeHLG1XVngPKykrdU0kqPB4Y6AtHo83j+fzJB0AGcFUAQmgev993xe93s76+l8lkpJfJ5MTPZHLiWIhScnv74EDXBT6f54oQWrVxFaAoKoahI4Qgk8mfmKa5WqnNziaysqxomlZC13UURa3OrUq6eWkzhOj0Cmkfr5n1TA7OdU4O9leFc78kr3WaxlXKeO92f4+8AwmgDmA12TfqDdYnrMjVkVBjKHAiFUQkIK/XbuhYhPqbmsNB9VQpeQp7y4ZQXww82fjsAchK3IuP3Rpt6sgBx4AThOBQLSCGBeTBcQLFnY47X9/vfgPKgKOcjaXuQDHHheEAksDakDjKhc5mcJhzMAoq+LQLzA4US3BwgiE5HOacM0C+6GAVNfCKvw2VrpYNig7HKhgWVslFvlgDcBxANcCvgasObAdMu2w0bdAtKBlg2GBYoLur/OoaMewySf8jMmwwrbLZtM/MpgU65/+BcIJnoiqgBla5N22EcJ8D7Mx/kuUGr78R2ym/xIH/5YrukoEdgN/duVvodorv0QAAAABJRU5ErkJggg%3D%3D";
const IMG_ENCRYPT_OFF = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAXNSR0IArs4c6QAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAAsSAAALEgHS3X78AAAAB3RJTUUH2QEVCjEFGOIfsQAAAVZJREFUKM9dkEtLAmEUhp8Zx1G7QxfBSKQgaCEFXRAKatevaV3bduGyfku0aBNFERFUi0CCpCKi1Eqdxpn5/D6/FqNGvofDgfM+cC4Gbe3FxxdGl4ZGwamWryo3O37Yj4RlNzG8urK+2J8mxVQ8nvkwcu8nsgtsG31zaxuz0WLr0i80G+ZMxE4+f62UzgELQEST2XSsoI7uGqeI27Xv5flYMvtVQIAJ4Jn2SIz7n4/rfC3veRcPdUF0xDOhDbg08SgF8h1g33VkgMCFzohJ2zerSDM3mAPgKeISmJkEPhhwMJ1YHUoPWFUZL4U3eRPDliudV+9sq2hBdWZzegwNFim60tZL5vCNogUVGjj8l8bhkUq4Q4U6do/tUsbpAHVcYm0DNC18aigC6iGgCfAw0CgUColAIpHozpkSjUIiUe2UKJp/f2j1mBKFwu8Cn8ciamt6Qwg+4RdRkqVTc2IXgAAAAABJRU5ErkJggg%3D%3D";

const IMG_INLINE_ON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9kBDxIDEyzXu6IAAAJDSURBVDjLXZK9S1thFIef9354ufEak5qQpoFq24QSGqXg5FKodCxd/Q9CCYKDIDh26No6SiY7lOImpV3qYkGw6tA/QBAFSYg0QWL0er/ydnjVfJzl5ZwDz/md33uEnJx8STw+hWVNYppPsKwi8JRO5xFh2EXT/tLtfqJW2xXn5/8YCiGnpyWLizAyAokEWBaYJgQBHB+D68LJCdTrR+zsfBSt1pd+gMHERIN8PkO7rSqeJ/E8gWXBzAx0OjA1Be12gVTqg9zY2BG+f9oDQAPIsLUFl5fgeQLXhYUFKBZhfx9aLZiflxQKCSwrju/TDzjH88BxQNdVVdPU22xCOg2lEgghME0b04wNrgCX+D6kUnBxMQgJQ8hkVC4lwAhBYA0CoqgLKJl3PgCcnSkzR0dV7vtgGHdD+wBhGCElzM1xv9v1Nd8rFd6trSlAtwuepxQNhYZhmICaNj4OzSZvKhV+AWxuwvY2HB2pbwUIQ20QoOsP7rODA14tL/MHcIFve3v41SocHqrpUvYMvgdAHCFUlskQ71tyFNChZ2wYgqZ1BwFRNAYoibkcP1ZWKN02nwH6mGoTBMoHXY+GTXSQUjVdF0oldstl1qtVXiwtQTKp3Nc0CAKJpg0BgiCGrkMspk44imB2lvflsjoixwEpJSBw3Rs872YQUK9/ZXU1QTb7kGz2MbadxbZjpNO9AzJNgeNAo3Hz+eoqfWvPFYAA+A3mBcR0cHSI+xArQKpoGHlyuTzJZAnbfk6tFv08PX39Fk7uFPwH1YnXP5gXXzcAAAAASUVORK5CYII%3D";
const IMG_INLINE_OFF = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9kBFQowNr4pT+YAAAJrSURBVDjLXZG9ThtBFEbP/KxnWdssjsFaW5YtgeSCBnqKiAqJF6BGIpQUvAgNFR2FeySkNLQUqZAi8QKYJkUArSG22d2ZSUHWipn205z73XPF5eVlYoyJK5VKLIRoaK1XgZU8z+vWWi+l/GWt/TEejx+Pjo4mfHo6DMNvOzs7BEGAMYYgCFBKYa3l6emJPM97Ly8vvfF4/HxxcXF7fHz883+AjKLoz9raGsYYAPI8ZzabAdDpdEiShPX1dTY3N79sbW19PT8/jxcaCCHegOr9/T3v7+8URUFRFGxvb5MkCaPRiMlkwsbGBqurq6FSyiwAvPcTay1hGCKlBEAIgfee19dXqtUqSZIgpUQppZVSwecG79ZaoihCSokQ4mM3KfHeU6/X8d7jnANQzjm1AHDOeYDpdMp0Op0HaZqitSYIPgZaa0uoXJDonPPOOfr9PoPBgMFgQL/f5+zsbA4sG/xrsXhGKaX03qOUQmvN8/Mz+/v7tFot7u7uaLfbNBoNlpeXAXDOiYUGQoilcu/RaMTe3h4PDw9kWcbV1RW3t7c8Pj7inMN7P3c0BwCmtB7HMcYYlPrwFATBXGy5hpTSLwC89xUhBM456vU6w+GQJEkAaDabLC0tUebWWoQQ/rPEShlmWUan02E4HNLr9Tg4OGB3d5dut4sQogS4z2cMSoGl6W63y+npKdVqlTAM5/azLCuKoigWAGma3l9fX5uVlZVarVaLjTE1rXVQq9Xm1ZVShGHI29tbcXNzUwUCIAfQh4eH309OTuRsNguEEBUhhHHOBc1mM2q32404jr9EUdTSWjfTNHWtVut3+RngLwdWF4aAJ/0ZAAAAAElFTkSuQmCC";

const IMG_ATTACHEMENTS_ON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9kCBQkqCNqaO4AAAAMmSURBVDjLfZNdaFtlHMaf93zk5JzTsNjEtKW1VdnoxqYTqzJHwU8wFh25Eb2QsV6IV9VrFZFQClYRpLY2ksa2idBetBeGqdBZECmio3MT7Fa7wGzjsnw1TdOT057kfc/fKxGd7nf//Hgungf4FzMzMwCA4eFhZXJy8ngsFjs+Pj6uAEAqlcIdGRsbAwCMjo7el06nr5XLZZ7NZvnc3NxaIpHoBYDp6ek7S5LJ5Iurq6sOEVG5WCC7bhER0YUL3x6kUqnIf4b+qhaPx5OFQoEO6rv0buI7d+DtL+nch0sUnf3BJSLKZrMUi8W+AIDZ2dm/BSMjI56FhYV4pbJNl6/ecPuGFt2PvtqkS7/btHT5Ft2s7NN7yZ/cA6fhlkolmp+f/3xiYkIDADY1NRXw+Xznw+HwqVv5Ar322TX29JOncTQk4Z1Pz2MzV0ZnsAWL0QjkZg0nj92PSqWC5eXlFdu2z8jhcPhEJBKJlktFejPxC3ug71Hsc4Yfr2TQ5Bx7chBN2YfYNxtoVSyc6GqBR9MoEAj0rK+vLyoKc11VIriyl+mH2pDfcdAdZFB4DV9Hn0PR4uDchUuEFrYP3TCwZ1nMsixIkuQqU1d0pG+uQFFU3NPZjqXftuHXDmFtaxevfrCMc8/24pWnDsOu29izHHh1HflCAfV6HZIkQXr+qISt3DYe7O3GgQDy5Rp2LAdnX3gMxVoD/cfuQqWyAy4EDMMAEUEIAc45AEDqaXHw8eun8P3PGaz8mkezUcfFjRJu/FHEW2fuRXO/BiEEarUaZFm+bQKS7XA8fCSEl/u70dejo1Vz0X/ERD5fxBMnuxAM3g3TNGEYBqrV6u0CxhiawsVAXzu2Kzt46fEOrG1sIf7GaWiaBiEEGo0GVFWFbduwLOsfAgWAxDlHd2c7Phl6Bo8MLSAdHaBgoJW5rgshBIQQJIRgbW1tcBwHjDEwxgAALJlMdjiO8z6ADlVmvs0qU7v8khIMtJp+v9/w+Xy6ruter9ereTweSVVVZDIZVKtVnsvlHmL/d6rBwUEjFAqZpmnquq5ruq5riqKojDGJMcZkWd71eDzX/wQIV3ntsohEcwAAAABJRU5ErkJggg%3D%3D";
const IMG_ATTACHEMENTS_OFF = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAXNSR0IArs4c6QAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH2QIFCSoiASHyVgAAAY9JREFUKM9l0cFLVFEYxuHfd+65M3PveEWd0RIxqEWNRmEpLYJAtMWAlC3cBBmUm6BCiP6DimwnblzYKkQQN1G5y12bIJQWkujCgsSJGa82zkxq53raaGP0rV5entX7CUfuiUqnBVN4sF/tpBpf1Lfdvpz6xYdCZWqo8B94lWm/2enkSeLz3uSmB7/8AyYGrnfUMGlXpJ7j9q58Z/bzvZkD8Mw5c62na92O0ifnCTnJa3uLoszNb7y5b+SlHwxmW3N2TLppZow1GnmOoZ2QuW+VSSfbdKM3b8flIr9ZwCAo3hLjBHGbqlta1GIVSmoJaSRihG0MFoVPSUooqz+yiqaFRRJ85SlZrlKmhMcPyijUOdbIYMizTT8/OUtIhI8lwgC6lodMUWaPJeIMsIOmQsPf+dQup+nmFB4ZclwgTRKfrSoQIi4RcoVlHhMnYg+XCqVDgBhaeMQswzZFQJKEVRzDIgigg+K7BQIn3uN8UqtuXSzQnk7omLhsUtxXRo6++47bFEu6nuNprUREnJ2hjT8qVH2tuwQkmgAAAABJRU5ErkJggg%3D%3D";

const IMG_ENCRYPTED = IMG_ENCRYPT_ON;
const IMG_ENCRYPTED2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB9gFCxQBOXBpjnYAAAIFSURBVDjLzZHPS9NxGMdfn8++Op2hWaNE58LZKRNKI1MLRKZ06NahGYs6dO/SLaiTdFDoj8hDh04FefDHpLnAQ1oYUWFB6tRDsFmXre8+z9NhMqZ2rwceHngenhfP837Dvw7zt+bo6MAJ53RMDfWVpkilCJTU8SqdXvp4CBCPX44psmqMCRlTPVZUQVURkXJ1esc7CFD1H9lATcgag7Fm70yDoqiW0xiDqmKNXjsE8GqCV7u7z1EsFPj67TPGWIwBFKQCEEQUh3wIVC8PDfVdirRF7p2KdjA+PkEkEmVrO8uvn7vYwB6oSjaLPDAA/f399YODF58kxpKJnvO9TdW/iwip1BzpxRSrq+8oFguICCKyWywEwhagpeV4sq6ufqC350LTfuEgm92k+VgziRu3uDl2m9raIKoKSmphYaHkJZOJ+7FY55l4fOToQT0mJh8zOzuN7FlojS1/oAowA2Cnpp5NZrObnxYzr/ctz8/PMj39At/3y7aJ4MThnMOJoOrPAAQAVlbeZ0SK4VCo4UpX11kAGhqOkMksspvPlT1XUKlY+X1+bulhBQAQDjeeXF55e31jY53W1gjRaJTh4RF83+FciVw+R6lUKkOE5+vrWy/3edLXd7rxtx98ao0Z9Dyvtj0a9TpinTbS1m7rgkGTy+fM2toX3d7Zcbn8j7tv0stT/BfxB+vd+QMX9EoXAAAAAElFTkSuQmCC";


const IMG_MAIL_NOTHING = IMG_ENCRYPTED2; //FireGPG's logo
const IMG_MAIL_ERROR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB9kCCwsMLMYc/ygAAAKjSURBVDjLxZNNTFRnFIaf77v3zjjTiTBhhCEpBLXhp8PEsZTiWCH+BQm6aMIGUgIs3DRNdMHoyqQLNqTRvQt3ZcHGrrCbBmOlNK0jA6IxI7HBDAUVkJ8WgRnmfscFSmo17bJn8ybvSZ6Tc3Je+L9Lvc9sbj5c7LrSIQrfjmnMjhjIi8sPIyO/PXwHcPLkkX2Cua+U8iv197YgAiKCMWZbXemx/wkQ2fpGW45fK4XS24Dg8xf4/3qJWIr58B42HQcRQSs58w7Adrwt0WiM7OYmi3d+5av4cfZWCh7LQkIhJgYHuf3sd5KxGlzMg7cAR482HAqXhItDRXvoaDrBn04Ae3UVX18f2VyO5USCymgUj23juzPJyGeRHwGIx+O+ROL81btjyRVjjIiIDLe3S7qtTZY2NgSQ/v5+yczPS7q1VTIXLsg1kG8tq0cDhMNFnbt2+Q7XffJpgVKK6eFhildWcLq6kPV1nNc72/k8/t5ezM2blDU24tP6vO7sbE9Eowfizc0thW9WeZpM4ltdxamvx3VdysvLqaqqwuv14onFULOzFO7fj7GsmB4YGLw8O/tH+ufR228d06ytAeC6LhUVFVRXV28DHAdPIIDO59FaYwGMj98bNSYb8vs/aIxEaslnsywPDeGtrcUKhwkGgzQ1NWFpjTs1hU6lyCwtsTQ3N2G9mRgK7S5JjY+1zcxkiBxpJDN0g2A6TUF3N1+cPk1paSkfHzyIe+UKG7bNo2SSxeXlizuv1tDw0e7clvc7rdTntm17Kv0Bz9mFFW/FsWN8X1bGqZYWSq5fZys1xpOFRcYmJ1Nfr6/XqX/JifdLaG+LRK7VOI5dGAhgCgqYevyY0enpXy7lch0KFtV/hM0Gis5BaxF8KJC7pfVPt4x5YMNGHtxXaJEJcLLt+u8AAAAASUVORK5CYII%3D";

const IMG_MAIL_SIGNED_OK = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB9kCCwsSBCfoaA0AAALySURBVDjLldNdaJt1FMfx7/OWJ4kxyeIsZXU2Ha3aTYwvQzu11gkD3RxKccz2QoZMFPHOC0F34c3uBFGZq6BeiOxiIkO0FRE36ypuXceYqabapknXrmuS5cn7y/P69yLonW/n/nx+B845Ev+jRL1PAxHF9YKoSh1VKiv/vTkuI3E3cAiFZ4FeEFelDz58/4Rjuzv+DdA0xxp9fCobiYSGZDUR8dzzOeGmj6uRcHTs4IEx7EaJlctnAOhN7Ea7YRNCCIQQnQlEE2HmdiqyBdoeZLFx40ZBf0L9M2F+6hgY0wghuHzlZ27f9yq1Wg3DMOju7iabXSS+tYdwcBZVHEeIAMnUXff+BawkTzP0QBeOaXNu7jt6Rl4kmUzieR6VdpHMlSVWr/u5pSvBHX2bQLkHo5KMqQC5fJqi8DF/KYXnQc6OYDkl+rffylcL7xJyQrBFYAIlS+b8pQxPDg4jkFEBZudO8bu3QKZSxmw71EWQ8LlPuSB9y+Hho3SF42iyDoDjWWxUM7x9dpyE93wHGOjfxdLSBUqVHIEwRPUwaXme0ftfRg/4KdvrIAAJyo0CDbPK/p0v8PX3pzpAd9cODj03Qa1WAgF1q8rn2SO4apN0eRZN1fEpOmvFNFbTJR5NcHFjEn2z1QFM00RRFBAqrVaLQiVH1Vtnbu1LCnmDQFDHH9Bx6zqvPfoZuhpk8rf3MKl1AJ/PhyRJxGIxAPSo4NrqErVmmYmnl5lePsGZ9Ce8uWcS02ny+jeP0Aqs0aybqM1mY/HszPSA53kgdVbadmtE6SUQUJnJnGRk2zgj28ZpOw2O/XQYPeJxW/g+Ur8sOqpptodSC79qtm1LuVxeM4qGzygXA+xOH9n32OjB0ysfIyHzUN8zvDU9RiQWYnvsYfKlda4ZKx9Jf3f7eyfYrMn+Hw48+Mrg2vVl2laL/i13svWmAa4aaU7++E7KtNvD0j890N4JblYk9Y3Bnl1PhfRIPOSPkq+uZudXZ77wcI9OvUThD8SLVVhABI1IAAAAAElFTkSuQmCC";
const IMG_MAIL_SIGNED_PART = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB9kCCwsVCo8R080AAAKxSURBVDjLlZM9TBMBFMd/x117PSwtKUhUNCJ+oiYOxCD4gRoboyZqjMbo7OCgC4NEYXDAzcUQExh06EAMxsEPTFw0VQyD2sGq+FUsUIu9o6XQctej16vDGZ38estLXt77vf97eU/gP6w8ulvG9CzGwovMHFWGKv1z8eugiK60kA40U/B7qJqdx9aeCrGWrRd9ieRfQWXFjf/C/pJLWiPiDkBJw176elpqTM9IhEIwPQ337jnZhw9DbS1YFpRKTsyyQNNEKkRY5Ae1iPXGV/Orc08PxONg2xCJQFcXTE3BxASsXw8vXjje5wNdB1FEuBMRfgLi0SgN7e2Qy/ExEmGdpsGDBw4wm4WREYhGoakJWltBUXB/TVEBQDTKAqCGw3yLRMgAGAYEg79U1NdDVRUkEtDfD6oKgKMgFCINxIF5wAbo7XWKe3pg+XJQFEeqYTiQzk6oq/uhYN8+NgBLgNVAM0A+Dx0d4PU6IySTDjAWg1QKzp+noKoItwYHyvuDByhTJpebgTLkF+a4E++mbdMBzKKBS5JxizKJdIwFvURD9RZefRsik9WcEUzTRBRFKEsYhoE2m2LOTvIycR9NzaBUyngUmVJepnP3bWSpkqEPvZjkHIDb7UYQBAKBAABydZmpyc/k9Cx9R8cIjw3wJBbicnAI09K59GgXhpJAz5tIuj7/6dlweK1t2yA4eyqUclSzEkWRGP4ySHvjadobT1Ow5rk+cgbZb7PO18zo20+WZJqFbaPv37mKxaKQSqmuTDrjzmTTCnti3Yf2Hjv5ePwmAhVsX3Wcq+FT+ANeNgZ2oM4kmcqM3xB+d/sH+6h1VXienmg715SYHqOwYLBm2WZW1KzlaybG4PNro2axsFP40wMd7GOxKEhdTfWtR7yyv8HrqUadm4y/mRy+a1O68vAs2nfO/S7/DljUrAAAAABJRU5ErkJggg%3D%3D";
const IMG_MAIL_SIGNED_ERR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB9kCCwsPH1Lhzf0AAAL7SURBVDjLlZNPTFN3AMc/v9f39loKtEU6bMWGjT+FSIVtgYSDCTGGmWUnjcFF4xKI241EIXjZwat3IzHxtpiJHnbYSTITSLPN4GqawCAsWkPsI0WlpY9ieX9/O5jtOOP3/v1+k+8fwQfAMAwFCHqep6mqaiuKchD4ALIQQhwGPgsEAv1AFNgTc3NzZx3Hib9PQNM0b3R0dDcSibTruh60bbtm2/afaiQS6R8fH2d/f5+VlRUAMpkM4XAYKSWe5wEgpcQ0zWQgEKChoQHXdVuq1WqX+q/DwsICOzs7SCkpFouMjY1hmiblchljfr7XyOU+bo7FnP7Ll/+KZzKmEIJCoZD4T2B1dZXh4WEsyyKXyzEyMsLijRufdAWDFwY8Tx3KZJCtreSnp7/MOc7G19nsT7VaLaQAlEolXNcln8+ztrZGvV5n/f79o58Hg9+2VKtq6No13Kkp3jx9Svr4cZkKhdI/Dw5+D6AALC8vU6vVMAyDQqFApVLBX1o6r21u0nbzJq3JJD/eu0fzrVtY5bLoPnVKimIxsTc/P6AA9PT0kEgkaGpqIh6PkyqVPm13nLB26RLy7Vs0TUNKieq6NExP4z16JI6eOIH3+PGICtDW1sbk5CSmaSKl5I+rV5OhV6/QhobwPI9UKkU6nUbXdZTBQSzDIHr6NN6TJ4dVAMuyUBQFgIODA2zbxq/VAPA8j46ODnp7e9F1HeH7yMZGFNdFUZR3Gei6jqZpxGIxkskkXSdPblUdByeXw/d9JiYm6O7u5iNNI/D8OXpnJ3svX6JGoyW1Xq+Xs9lsi+/7CCHeddrZWZCw33z7djj04AEzMzP4vs+5ixfh7l2sI0fkzsOHwunr+1W1LOvO+vq64jiO2N7eVsrlcqBSqajpra1cq6r+EpydZfbKFb4YGGD/+nXcjQ25+fq12N7dzQfOnPlO/M/89Qtw/uyxY3f6NE2NNjbiRyL8/ewZv7148fsPtv2NgDfiPR9SgUNT8NUhaJdgLyrK0qLvr6pQd8H7B2duUZ+Uyio4AAAAAElFTkSuQmCC";

const IMG_MAIL_DECRYPTED = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEgAACxIB0t1+/AAAAAd0SU1FB9kCCwsYANpqRJ4AAANJSURBVDjLZdJdTFt1GMfx72lPe9pSWggvpRukjC7Ausxtjo0sETfN5oze7Q4S44XeYHRXNjP4QoyGmNALDRqzaDS6iyXqljgDupnMYLZhyAjMQKBMxluFUkpPOaXn7Jz29HhBwEX/d0/yfz7Pkzw/gf+8vr7LlTU1/perqyu6fT5PM0Aupy6kUvJAOq183dPzkvz4f/vjRW/vl1V+vzfa3n7w3ba2lkAoVMvevVU0NNRWuFzO08lkxt7efm5iePi69j8gGh2weTyu8x0dT/S2tDSUzc0tF0ZGJrMzMwuqqubt+/fXS06neGhhIfng+PGzk3fv/mwBiDuAYRTKAoHKrlAo4J+efqgPDf3xrarqHwL58XHhoixnXztyJOIPBCq6MpnNH4EcgG0H0DRdlCRnoyTZmZp6uLa2Jl+KxS4sxWIXNjTtUSweTyQMQ8PpFBs1Td8dvAvk8yqFgoGmaaytZTaLxeIEwNGPEMbCUTOVXywlNxfY1NftiiYLO3270sm6aS/aHocmL+MopsSeY1f2nDhaVzXsUF4/eaDznNuRr39g3kBs1vaVrMv9z57grVtvsC4ATMQiZx1uT9SsDHd4y72uTTmr2Rzp+Od6vLX7+W9ctb5GHDYJgGLJIKnM0z/UubSiZJ4UAG6+Helvf+W5N33BNLCFZZW4NDpJa9M7BP1hLEpgAQJk8+vkdQULk49vdn8iAqymS5jqLChpABS9QKZYjSmqzGVHcYgSTrtEYmMOQzVprDjMWHKQA/Vt50WAlbRFIauCUwdA1wxkE+4lfmI9lcHtkXC5JcwtiYunv0cSPQzGB9CtXIMNIKNYmIoOsgayhqDorOb+Yv7vWWIvjnIm1E0hJ/LemUEAem48jeZOsFVKbV/BsgC1AJIONgGpUCQo+MDt5/b8d5xq6uJUUxePink+G3kVyV+i2XeMP6fHl3dzQKG0LRkm5bpJeCtLqPYgtxa/4s78DwDEhjtxegUiwacQjUqS6ZVr/ybRcm8jehHBMOl0SMyMXSNcc4jbS1d4/9cX2FfXyuHgMxTz8NvvVzcs0/pgJ0iz13/J5cocUjkla3sTC1ptZYwuf4E3EsFVVUVKXmVm6g7p+5NGMF7T9+nVxY1/AAAGgNmIJlI/AAAAAElFTkSuQmCC";
const IMG_MAIL_DECRYPTED_PART = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEgAACxIB0t1+/AAAAAd0SU1FB9kCCwsZHjl+SLwAAALoSURBVDjLXZJdaFMHFIC/e73JzW2adqFNaRj1J7K2ZEwpFX+CGi2lo8re/QEfRJA9+CYM9jAYg73Ml6G+KBT2NPwFlbKVORclRRuqqzK11knVpN40Js31psnt/cv1ITR0O0/nHM75zq/A/+QZKBthUIlGd9HV1QlAoVA2VHXyNUzHwVgbL6w1pqHlU0h2j4zsJpGQ8PvBccA0YWrKyd++nV6Au9ugtpojrSoTIASgrzuZ3EkiITE15ZJOmziOR1+fzPCw1K3rO/OZTH4CZr4E7z+AFfDHYIAtWwKkUk4mlXq0BH8Cljgzs29kcXEXo6OBWCYz8BaeASaAuArQQFREMUxrK1YqtfwSHoyCNgq1KtybVdUPGAZBCGtr8ppKBbDqddB1XsGKDSrApcZo9QJ45HJoIGprdtccIQ5yBdZ1LCxggngI2vZAiwaJwWi0l2CwHVWlo7MzvL1YPHAHfhuCqgCwCJ+FIKmEQpuIRCRyORuf7/1ctdrVe/y4RE8P+HyNSrYN2SxPx8a0LPwsADyCgwNHj+5l/fpGkOvChQswNETT53kgCFAqga4DcP/GjbQA8MvJ/p++OhU7HY4UAfhg2pyf87EjfgzTNvBJMv51MrnSK6yay8ZPtvIwP86iPp+VAN4VPWytBn4TANOwKLswnbvF+8ISSotMQJFxl2W+2XcFWWph/MVZTK/SIwIs6R6ubkLZgLKBoJuolX+ZX5jjzMEMwxu+xq5IfDc8DsC3E3sxlBzL9ULjCp4H1GyQTRAFZNshKrSB0k56/jLJ2BGSsSOsOFXO3z+B3F6nt22QJ8//zjb/ALveIFkuIdNl87LGhq7PufNmjMn5qwCcuXsYf6tAPLobyQqTL7673gQYntKAmA6C5XLYJzP78DqbI1+Qfvsr3/9xgE3d/WyN7sepwl/3rpU81/th9ZHmbv5eqQR9coi61+jEg34xSCZ7kdZ4nEBHB4WyyuzTSYqP/7GiLyI/nrv2pvQRvhs70Pl4bw0AAAAASUVORK5CYII%3D";
/* NO USED ? */const IMG_MAIL_NOT_DECRYPTED = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEgAACxIB0t1+/AAAAAd0SU1FB9kCCwsXBS2YrN4AAANJSURBVDjLZdLNaxp5GAfw78w4M2pdG19iXqwSanxJwUSqIZaNuC+ELGTpn9BD2HMPViiEQPayOe4hPRSh11JPpfQgOSRdsoQIy9p0uyGblalbG5OaEMfo6IyZ1z0sSnf3gefwwO/34XkeHgL/ifX1dbPL5Yp5PJ6E3W53AUC73b48Pz//pdFo7K+srPQ+fU99WqytrVnsdvvnyWQyHY/Hr/n9foyNjcHn85lZlp2o1+vE3NxcfWdnR/0fkM1mCZvNNpVKpb4IhUJ0pVLRi8Vir1wuK6IokpOTkxRN0yPVapVPJBLne3t7AABTH1AUhXa73VGfz8ceHR1pm5ubv3U6nZ8ByARBzF9eXs7OzMywHo8nyvP8EQD5X4AkSaTZbB4ym804PDzs1Ov1X3O5XAsAVi0W1++Fwp1uJEITt26pkiSR/X8DQBRFqKoKURRxdnZ2papq/Qfgqy8zmYJP01iGomC43XiTzy/2Dg7uAPgWAAaS1+tlJEkim80mFEUhbxQKX9/NZLYdrRZrefgQ6v37uHj9GuHpaWM6FlvaoKjSYIkbGxs3h4eHFxwOh0eWZdJisTChZvORq9NhR548gcvphGd0FInVVfSePSNGk0njw+7ueJokKyQA8DwfSKfTNxcWFkyJRALjtVrohqJ8Rt+7B0MUQdM0DMOASVVhffAA2vY24UulwFBUhgSAi4sLiKIIQRDQ7XZxWiyOW1ot0LOz0DQNfr8f4XAYLMuCicVAnJxgKBCATlExUx9ot9tgGAYAoKoq9E4HAKBpGiYmJhCJRMCyLAhdh2GzgVRVkCT5zxIFQRh0IAgCrk1NnbYUBUqpBF3Xsby8jGAwCIamQb17BzYQgHB8DAp4QwKAYRjo9XqDdC8tVT4AXTWXg8XpRDabRT6fh84wwNOnuPJ6jQbHQZSkHykACAaDgWg06rNardB1HbIsg6eoY7pUum3lODgXF5Ganwfz+DHkgwPjfbVK/HFywmWurr4bHJKu61AUBZqmQVEU0PH4x5847kX01au739A0OfTyJXrXr6PMccQuzx8/DwS+J/b3rX2gsbW1JZtMJqY/kq7rquJwvH0bDnMj5XLQVqvZjdNT7S+v970aidTcovinAYh/AyrVgqGuncQFAAAAAElFTkSuQmCC";
/*
   Class: cGmail2
   This is the main class to manage gmail's function with the new interface.
*/
var cGmail2 = {

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

        var i18n = document.getElementById("firegpg-strings");

        var doc = cGmail2.doc[id];

        if (doc != undefined && doc.location != undefined) {

            final_location = doc.location.href;

            var regrex = new RegExp('^https?://mail.google.com/a/[a-zA-Z.0-9-]*');

            final_location = final_location.replace(regrex, "http://mail.google.com/mail");

            if (final_location.indexOf(GMAIL_MAIN_DOC_URL) == 0 || final_location .indexOf(GMAIL_MAIN_DOC_URL2) == 0) {

                if (doc.location.href.indexOf("?ui=2") != -1)
                    cGmail2.baseUrl = doc.location.href.substring(0, doc.location.href.indexOf("?ui=2"));

                //test for messages
                var listeTest = doc.getElementsByClassName('gE iv gt','div');

                for (var i = 0; i < listeTest.length; i++) {
                    listeTest[i] = listeTest[i].parentNode;
                    if (listeTest[i].hasAttribute("gpg") == false) {
                        listeTest[i].setAttribute("gpg","ok");

                        var boutonboxs = listeTest[i].getElementsByTagName("table");

                        var boutonbox = "";

                        //On cherche la boite avec les boutons
                        for (var j = 0; j < boutonboxs.length; j++) {
                            if (boutonboxs[j].getAttribute("class").indexOf("cf gz") != -1) { //EWdQcf
                                boutonbox = boutonboxs[j].firstChild.firstChild;
                                break;
                            }
                        }

                        if (boutonbox == "")
                            break;

fireGPGDebug("ok");
                       // var contenuMail = this.getMailContent(listeTest[i],doc);

                       var td = doc.createElement("td");

                        var mimeContentOf  = this.getMimeMailContens(listeTest[i],doc);

                        if (mimeContentOf == "{ERROR,WAIT}") {
                            listeTest[i].removeAttribute("gpg");
                            if (retry == undefined)
                                retry = 0;

                            if ( retry < 10) {
                                setTimeout("cGmail2.checkDoc("+id+", "+ (retry+1) + ")", 1000);
                                fireGPGDebug('Reask (' + retry + ')', 'Checkdoc');
                                cGmail2.docOccuped[id] = true;
                                break;
                            } else {

                                td.setAttribute("style","color: red;");
                                td.innerHTML = '<span title="' + i18n.getString("noDataFromServer") + '" onclick="alert(this.title);  return false;"><img src="' + IMG_MAIL_ERROR + '">&nbsp;' + i18n.getString("error") +'</span>';

                            }
                        } else {

                            decoder = new FireGPGMimeDecoder(mimeContentOf);

                            var nosign = false;

                            if (mimeContentOf == "" || mimeContentOf == null) {
                                td.setAttribute("style","color: red;");
                                td.innerHTML = '<span title="' + i18n.getString("noDataFromServer") + '" onclick="alert(this.title);  return false;"><img src="' + IMG_MAIL_ERROR + '">&nbsp;' + i18n.getString("error") +'</span>';

                            } else {

                                listeTest[i].setAttribute("firegpg-mail-id", decoder.extractMimeId());

                                result = decoder.detectGpGContent(cGmail2.noAutoDecrypt);
                                var i18n = document.getElementById("firegpg-strings");

                                if (result.decryptresult && (cGmail2.noAutoDecrypt || result.decryptresult.result == RESULT_SUCCESS))  {

                                    if (cGmail2.encryptIfDecrypted)
                                        listeTest[i].setAttribute("firegpg-encrypt-this-mail", "firegpg-encrypt-this-mail");

                                    if (cGmail2.noAutoDecrypt) {
                                        td.innerHTML = i18n.getString("GMailD");

                                        var tmpListener = new Object;
                                        tmpListener = null;
                                        tmpListener = new cGmail2.callBack(doc)
                                        td.addEventListener('click',tmpListener,true);
                                        td.setAttribute("style","");
                                        td.setAttribute("firegpg-mail-to-decrypt", result.decryptDataToInsert);

                                    } else {
                                       this.setMailContent(listeTest[i],doc,result.decryptDataToInsert);

                                        if (cGmail2.decryptOnReply)
                                            listeTest[i].setAttribute("firegpg-decrypted-data", result.decryptDataToInsert);


                                        td.setAttribute("style","color: blue;");

                                        if (result.completeSignOrDecrypt)
                                            td.innerHTML += '<span title="' + i18n.getString("emailDecrypted") + '" onclick="alert(this.title);  return false;"><img src="' + IMG_MAIL_DECRYPTED + '">&nbsp;' + i18n.getString("decryptedMail") + '</span>&nbsp;';
                                        else {

                                                data = decoder.washFromPlain(result.specialmimepart).replace(/<br \/>/gi, '\n');
                                                rid="firegpg" +  genreate_api_key() +  "subpart" +  genreate_api_key() + "display" +  genreate_api_key();

                                                td.setAttribute("style","color: magenta;");
                                                td.innerHTML += '<span title="' + i18n.getString("OnlyASubPart2") + ' ' + i18n.getString("emailDecrypted") + '" onclick="alert(document.getElementById(\'' + rid +'\').innerHTML);  return false;"><img src="' + IMG_MAIL_DECRYPTED_PART + '">&nbsp;' + i18n.getString("partDecrypted") + '</span>&nbsp;<span id="' + rid +'" style="display: none">' + data + '</span>';
                                            }
                                        //td.setAttribute("style","color: blue;");
                                        //td.innerHTML = i18n.getString("GMailMailWasDecrypted") + " ";

                                        //if (result.decryptresult.result.signresulttext != null &&  result.decryptresult.result.signresulttext != "")
                                        //    td.innerHTML +=  i18n.getString("GMailSOK") + " " + htmlEncode(result.decryptresult.result.signresulttext) + " ";

                                        if (result.decryptresult.result.signresulttext != null &&  result.decryptresult.result.signresulttext != "") {

                                            if (cGmail2.showUserInfo)
                                                bonus = " (" + htmlEncode(result.decryptresult.result.signresulttext) + ")";
                                            else
                                                bonus = "";

                                            if (result.completeSignOrDecrypt)
                                                td.innerHTML += '<span title="' + i18n.getString("goodSignFrom") + ' ' + result.decryptresult.result.signresulttext.replace(/\\/gi, "\\\\").replace(/"/gi, "\\\"") + '" onclick="alert(this.title);  return false;"><img src="' + IMG_MAIL_SIGNED_OK + '">&nbsp;' + i18n.getString("signedMail") + '' + bonus + '</span>';
                                            else {

                                                data = decoder.washFromPlain(result.specialmimepart).replace(/<br \/>/gi, '\n');
                                                rid="firegpg" +  genreate_api_key() +  "subpart" +  genreate_api_key() + "display" +  genreate_api_key();

                                                td.setAttribute("style","color: magenta;");
                                                td.innerHTML += '<span title="' + i18n.getString("OnlyASubPart2 ")+ ' ' + i18n.getString("goodSignFrom") + ' ' + result.decryptresult.result.signresulttext.replace(/\\/gi, "\\\\").replace(/"/gi, "\\\"") + '" onclick="alert(document.getElementById(\'' + rid +'\').innerHTML);  return false;"><img src="' + IMG_MAIL_SIGNED_PART + '">&nbsp;' + i18n.getString("partSigned") + '' + bonus + '</span><span id="' + rid +'" style="display: none">' + data + '</span>';
                                            }
                                        }

                                    }

                                }
                                if (result.signResult != null) {

                                   if (result.signResult.signresult == RESULT_ERROR_NO_GPG_DATA) {
                                        if (cGmail2.nonosign != true && !result.decryptresult && !cGmail2.noAutoDecrypt)
                                        {
                                            //td.setAttribute("style","color: orange;");
                                            //td.innerHTML = i18n.getString("GMailNoS");

                                            //td.setAttribute("style","color: red;");
                                            td.innerHTML = '<span title="' + i18n.getString("nothingFound") + '" onclick="alert(this.title);  return false;"><img src="' + IMG_MAIL_NOTHING + '">&nbsp;FireGPG</span>';

                                        }
                                        nosign = true;
                                    }
                                    else if (result.signResult.signresult ==RESULT_ERROR_UNKNOW) {
                                        td.setAttribute("style","color: red;");
                                        //td.innerHTML += i18n.getString("GMailSErr"); //"La première signature de ce mail est incorrect !";

                                        td.innerHTML += '<span title="' + i18n.getString("unknowErrorCantVerify") + '" onclick="alert(this.title);  return false;"><img src="' + IMG_MAIL_SIGNED_ERR + '">&nbsp;' + i18n.getString("error") + '</span>';
                                    }
                                    else if (result.signResult.signresult == RESULT_ERROR_BAD_SIGN) {
                                        td.setAttribute("style","color: red;");
                                       // td.innerHTML += i18n.getString("GMailSErr") + " (" + i18n.getString("falseSign") + ")"; //"La première signature de ce mail est incorrect !";

                                        td.innerHTML += '<span title="' + i18n.getString("wrongSignature") + '" onclick="alert(this.title);  return false;"><img src="' + IMG_MAIL_SIGNED_ERR + '">&nbsp;' + i18n.getString("wrongSignature2") + '</span>';

                                    }
                                    else if (result.signResult.signresult == RESULT_ERROR_NO_KEY) {
                                        td.setAttribute("style","color: red;");
                                       // td.innerHTML += i18n.getString("GMailSErr") + " (" + i18n.getString("keyNotFound") + ")";

                                        td.innerHTML += '<span title="' + i18n.getString("noPublicKey") + '" onclick="alert(this.title);  return false;"><img src="' + IMG_MAIL_SIGNED_ERR + '">&nbsp;' + i18n.getString("keyNotFound") + '</span>';

                                    }
                                    else if (result.signResult.signresulttext != null){

                                        td.setAttribute("style","color: green;");
                                        //td.innerHTML += i18n.getString("GMailSOK") + " " + htmlEncode(result.signResult.signresulttext); //"La première signature de ce mail est de testtest (testtest)

                                        if (cGmail2.showUserInfo)
                                            bonus = " (" + htmlEncode(result.signResult.signresulttext) + ")";
                                        else
                                                bonus = "";


                                        if (result.completeSignOrDecrypt)
                                            td.innerHTML += '<span title="' + i18n.getString("goodSignFrom") + ' ' + result.signResult.signresulttext.replace(/\\/gi, "\\\\").replace(/"/gi, "\\\"") + '" onclick="alert(this.title); return false;"><img src="' + IMG_MAIL_SIGNED_OK + '">&nbsp;' + i18n.getString("signedMail") + '' + bonus + '</span>';
                                        else {

                                            data = decoder.washFromPlain(result.specialmimepart).replace(/<br \/>/gi, '\n');
                                            rid="firegpg" +  genreate_api_key() +  "subpart" +  genreate_api_key() + "display" +  genreate_api_key();

                                            td.setAttribute("style","color: magenta;");
                                            td.innerHTML += '<span title="' + i18n.getString("OnlyASubPart2") + ' ' + i18n.getString("goodSignFrom") + ' ' + result.signResult.signresulttext.replace(/\\/gi, "\\\\").replace(/"/gi, "\\\"") + '" onclick="alert(document.getElementById(\'' + rid +'\').innerHTML);  return false;"><img src="' + IMG_MAIL_SIGNED_PART + '">&nbsp;' + i18n.getString("partSigned") + '' + bonus + '</span><span id="' + rid +'" style="display: none">' + data + '</span>';
                                        }
                                    }

                                } else {

                                    if (cGmail2.nonosign != true && !result.decryptresult && !cGmail2.noAutoDecrypt)
                                        {
                                            //td.setAttribute("style","color: orange;");
                                            //td.innerHTML = i18n.getString("GMailNoS");
                                            td.innerHTML = '<span title="' + i18n.getString("nothingFound") + '" onclick="alert(this.title);  return false;"><img src="' + IMG_MAIL_NOTHING + '">&nbsp;FireGPG</span>';

                                        }
                                        nosign = true;
                                }
                               /* if (!result.completeSignOrDecrypt && !nosign) {

                                    data = decoder.washFromPlain(result.specialmimepart).replace(/<br \/>/gi, '\n');
                                    rid="firegpg" +  genreate_api_key() +  "subpart" +  genreate_api_key() + "display" +  genreate_api_key();
                                    td.innerHTML += " <br /><span style=\"color: magenta;\">" + i18n.getString("OnlyASubPart").replace(/%w/, '<a href="#" onclick="alert(document.getElementById(\'' + rid +'\').innerHTML);">').replace(/%w2/,
                                                                                                                                                                                         '</a><span id="' + rid +'" style="display: none">' + data + '</span></span>');
                                } */ //

                                var atts = result.attachements;

                                var attachementBoxL = listeTest[i].parentNode.getElementsByClassName('hq gt', 'div');
                                attachementBox = attachementBoxL[0];

                                for (i in atts) {

                                    att = atts[i];

                                    switch(att.type) {
                                        case "decrypted":

                                            var table = doc.createElement('table');

                                            table.innerHTML = '<tbody><tr><td class="kVqJFe"><span id=":ga"><a href="#"><img gpg_action="sattachement2"  class="xPxtgd" src="/mail/images/generic.gif"></a></span></td><td><b>%n</b>  <br>%t&nbsp;&nbsp;<span id=":gd"><a href="#" gpg_action="sattachement">%s</a>&nbsp;&nbsp;</span></td></tr></tbody>';
                                            table.innerHTML = table.innerHTML.replace(/%t/, i18n.getString("decryptedfile"));
                                            table.innerHTML = table.innerHTML.replace(/%s/, i18n.getString("SaveAS"));
                                            table.innerHTML = table.innerHTML.replace(/%n/, htmlEncode(att.filename));
                                            table.setAttribute('firegpg-file-content',Base64.encode(att.data,true));
                                            table.setAttribute('firegpg-file-name', att.filename);
                                            table.setAttribute('firegpg-file-type','decrypted');
                                            table.setAttribute('class', 'Dva3x');
                                            table.setAttribute('gpg_action','attachement');
                                            var tmpListener = new Object;
                                            tmpListener = null;
                                            tmpListener = new cGmail2.callBack(doc)
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

                                                tableBox.innerHTML = '<tbody><tr><td class="kVqJFe"><span id=":ga"><a href="#"><img class="xPxtgd" src="/mail/images/generic.gif"></a></span></td><td><b>%n</b>  <br>%t&nbsp;&nbsp;<span id=":gd">&nbsp;&nbsp;</span></td></tr></tbody>';
                                                tableBox.innerHTML = tableBox.innerHTML.replace(/%t/, i18n.getString("firegpgencrypted"));
                                                tableBox.innerHTML = tableBox.innerHTML.replace(/%n/, htmlEncode(att.filename));
                                                tableBox.setAttribute('class', 'Dva3x');

                                                attachementBox.appendChild(tableBox);

                                            }

                                            var spans = tableBox.getElementsByTagName('span');
                                            interstingSpan = spans[1];

                                            var newA = doc.createElement('a');
                                            newA.setAttribute('firegpg-file-content',Base64.encode(att.data,true));
                                            newA.setAttribute('firegpg-file-name', att.filename);
                                            newA.setAttribute('firegpg-file-type','encrypted');
                                            newA.setAttribute('gpg_action','attachement');
                                            newA.setAttribute('style','cursor: pointer;');
                                            newA.innerHTML = i18n.getString("decrypt");
                                            var tmpListener = new Object;
                                            tmpListener = null;
                                            tmpListener = new cGmail2.callBack(doc)
                                            newA.addEventListener('click',tmpListener,true);

                                            interstingSpan.appendChild(newA);

                                            break;
                                    }

                                }

                            }

                           /*

                            var encrypted = FireGPGMimeDecoder.extractEncryptedData(mimeContentOf).replace(/\r/gi, '');

                            var firstPosition = encrypted.indexOf("-----BEGIN PGP MESSAGE-----");
                            var lastPosition = encrypted.indexOf("-----END PGP MESSAGE-----");

                            if (encrypted != null && encrypted != '' && firstPosition != -1 && lastPosition != -1) {


                                if (cGmail2.noAutoDecrypt) {

                                    if (td.innerHTML == i18n.getString("GMailNoS") || td.innerHTML ==  "") {

                                        td.innerHTML = i18n.getString("GMailD");

                                        var tmpListener = new Object;
                                        tmpListener = null;
                                        tmpListener = new cGmail2.callBack(doc)
                                        td.addEventListener('click',tmpListener,true);
                                        td.setAttribute("style","");
                                        td.setAttribute("firegpg-mail-to-decrypt", encrypted);
                                        td.setAttribute("firegpg-parse-as-mime", "firegpg-parse-as-mime");
                                    }

                                } else {

                                    var result = FireGPG.decrypt(false,encrypted);

                                    if (result.result == RESULT_SUCCESS) {
                                        data = FireGPGMimeDecoder.parseDecrypted(result.decrypted); //For reviewers, a washDecryptedForInsertion is applied too in parseDecrypted ;)

                                        this.setMailContent(listeTest[i],doc,data.message);

                                        if (cGmail2.decryptOnReply)
                                            listeTest[i].setAttribute("firegpg-decrypted-data", data.message);

                                        td.setAttribute("style","color: blue;");
                                        td.innerHTML = i18n.getString("GMailMailWasDecrypted");

                                        if (result.signresulttext != null &&  result.signresulttext != "")
                                                td.innerHTML += " " + i18n.getString("GMailSOK") + " " + htmlEncode(result.signresulttext)
                                        else if (data.signData ) {

                                            var resultTest = FireGPG.verify(true,data.signData.replace(/\r/gi, ''));

                                            if (resultTest.result == RESULT_ERROR_NO_GPG_DATA) {
                                                if (cGmail2.nonosign != true)
                                                {
                                                    td.setAttribute("style","color: orange;");
                                                    td.innerHTML += " " + i18n.getString("GMailNoS");
                                                }
                                            }
                                            else if (resultTest.signresult ==RESULT_ERROR_UNKNOW) {
                                                td.setAttribute("style","color: red;");
                                                td.innerHTML += " " + i18n.getString("GMailSErr"); //"La première signature de ce mail est incorrect !";
                                            }
                                            else if (resultTest.signresult == RESULT_ERROR_BAD_SIGN) {
                                                td.setAttribute("style","color: red;");
                                                td.innerHTML += " " + i18n.getString("GMailSErr") + " (" + i18n.getString("falseSign") + ")"; //"La première signature de ce mail est incorrect !";
                                            }
                                            else if (resultTest.signresult == RESULT_ERROR_NO_KEY) {
                                                td.setAttribute("style","color: red;");
                                                td.innerHTML += " " + i18n.getString("GMailSErr") + " (" + i18n.getString("keyNotFound") + ")"; //"La première signature de ce mail est incorrect !";
                                            }
                                            else if (resultTest.signresulttext != null){

                                                td.setAttribute("style","color: green;");
                                                td.innerHTML += " " + i18n.getString("GMailSOK") + " " + htmlEncode(resultTest.signresulttext); //"La première signature de ce mail est de testtest (testtest)
                                            }

                                        }
                                    } else  {

                                        td.setAttribute("style","color: red;");
                                        td.innerHTML = i18n.getString("GMailMailWasNotDecrypted");
                                    }
                                }

                            } else {

                                var encrypted = FireGPGMimeDecoder.extractEncrypted(mimeContentOf).replace(/\r/gi, '');

                                var firstPosition = encrypted.indexOf("-----BEGIN PGP MESSAGE-----");
                                var lastPosition = encrypted.indexOf("-----END PGP MESSAGE-----");

                                if (encrypted != null && encrypted != '' && firstPosition != -1 && lastPosition != -1) {

                                    if (cGmail2.noAutoDecrypt) {

                                        if (td.innerHTML == i18n.getString("GMailNoS") || td.innerHTML ==  "") {
                                            td.innerHTML = i18n.getString("GMailD");

                                            var tmpListener = new Object;
                                            tmpListener = null;
                                            tmpListener = new cGmail2.callBack(doc)
                                            td.addEventListener('click',tmpListener,true);
                                            td.setAttribute("style","");
                                            td.setAttribute("firegpg-mail-to-decrypt", encrypted);
                                        }

                                    } else {

                                        var result = FireGPG.decrypt(false,encrypted);

                                        if (result.result == RESULT_SUCCESS) {

                                            data = FireGPGMimeDecoder.washDecryptedForInsertion(FireGPGMimeDecoder.demime(result.decrypted).message.replace(/\r/gi, ''));
                                            this.setMailContent(listeTest[i],doc,data);
                                            if (cGmail2.decryptOnReply)
                                                listeTest[i].setAttribute("firegpg-decrypted-data", data);

                                            td.setAttribute("style","color: blue;");
                                            td.innerHTML = i18n.getString("GMailMailWasDecrypted");


                                            if (result.signresulttext != null &&  result.signresulttext != "")
                                                td.innerHTML += " " + i18n.getString("GMailSOK") + " " + htmlEncode(result.signresulttext)


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
                                tmpListener = new cGmail2.callBack(doc)
                                td.addEventListener('click',tmpListener,true);
                                td.setAttribute("style","");
                            }*/

                        }
                        td.innerHTML = '<div class="mD" idlink=""><span class="mG" style="' + td.getAttribute("style") + '">' + td.innerHTML + '</span></div>';


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

                        boutonbox.insertBefore(td,boutonbox.childNodes[boutonbox.childNodes.length - 1]);
                    }
                }



                //END OF THE TEST FOR MESSAGES.
//fireGPGDebug('Begining test for compose messages', 'ProbWithReplyForward');
                //Test for compose buttons 'CoUvaf'
                var listeTest = doc.getElementsByClassName('eh','div');
                var listeTest2 = doc.getElementsByClassName('CoUvaf','div');

//fireGPGDebug('1:' + listeTest + ' 2:' + listeTest2, 'ProbWithReplyForward');

                listeTest = listeTest.concat(listeTest2);

                for (var i = 0; i < listeTest.length; i++) {

                    if (listeTest[i].hasAttribute("gpg") == false) {

                        fireGPGDebug(listeTest[i] + 'NoFireGPG, processing', 'ProbWithReplyForward');

                        listeTest[i].setAttribute("gpg","ok");

                        //Position to add the button
                        var spamLimite = listeTest[i].getElementsByTagName('span');
                        spamLimite = spamLimite[0];
//fireGPGDebug('spamLimite is ' + spamLimite, 'ProbWithReplyForward');
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
                        }

fireGPGDebug('wheretoadd is ' + wheretoadd, 'ProbWithReplyForward');
                        /*if (cGmail2.b_sign == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailCLS"),"sign",spamLimite);
                        if (cGmail2.b_sign_s == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailCLSS"),"sndsign",spamLimite);
                        if (cGmail2.b_psign == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailS"),"psign",spamLimite);
                        if (cGmail2.b_psign_s == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailSS"),"sndpsign",spamLimite);
                        if (cGmail2.b_crypt == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailC"),"crypt",spamLimite);
                        if (cGmail2.b_crypt_s == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailCS"),"sndcrypt",spamLimite);
                        if (cGmail2.b_signcrypt == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailSAC"),"signcrypt",spamLimite);
                        if (cGmail2.b_signcrypt_s == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailSACS"),"sndsigncrypt",spamLimite);*/


                        //Rajouter une propriété sur le button send pour le repérer
                        var children = listeTest[i].getElementsByClassName('goog-imageless-button-content');
                        children[0].firstChild.setAttribute("gpg_action", "send_button");
//fireGPGDebug('children[0] is ' + children[0], 'ProbWithReplyForward');

                        //Listeners
                        try {

                            var tmpListener = new Object;
                            tmpListener = null;
                            tmpListener = new cGmail2.callBack(doc)
                            listeTest[i].addEventListener('mouseup',tmpListener,true);

                            var tmpListener = new Object;
                            tmpListener = null;
                            tmpListener = new cGmail2.callBack(doc)
                            listeTest[i].addEventListener('keyup',tmpListener,true);

                            var tmpListener = new Object;
                            tmpListener = null;
                            tmpListener = new cGmail2.callBack(doc)
                            listeTest[i].addEventListener('keydown',tmpListener,true);

                            var tmpListener = new Object;
                            tmpListener = null;
                            tmpListener = new cGmail2.callBack(doc)
                            listeTest[i].addEventListener('keypress',tmpListener,true);

                        } catch (e) {  fireGPGDebug(e,'cgmail2.checkDoc',true);  }

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

                            span.setAttribute("style","position: relative;  bottom: 26px;  right: 5px; float: right; margin-bottom: -30px;");

                            span.innerHTML = '<img class="en ed" src="images/cleardot.gif">&nbsp;<span gpg_action="add_crypted" style="font-size: 12px;" class="el">' + i18n.getString("GmailAddChiffred")+ '</span>&nbsp;<span gpg_action="add_crypted_and_sign" style="font-size: 12px;" class="el">' + i18n.getString("GmailAddChiffredSignToo")+ '</span>';

                            boxwhereadd.insertBefore(span,tablebox.nextSibling);

                            var tmpListener = new Object;
                            tmpListener = null;
                            tmpListener = new cGmail2.callBack(doc)
                            span.addEventListener('click',tmpListener,false);

                            //Rajout des trucs à FireGPG
                            var firegpgactions = doc.createElement("tr");


                            var title = doc.createElement("td");
                            var checkboxes = doc.createElement("td");

                            title.setAttribute('class', 'eD');
                            title.innerHTML = 'FireGPG:';

                            randId = genreate_api_key();
                            checkboxes.setAttribute('class', 'eC');
                            checkboxes.setAttribute('style', 'font-size: 12px;');
                            checkboxes.innerHTML =  '<img id="'+randId+'a" src="'+IMG_SIGN_OFF+'" alt="'+IMG_SIGN_ON+'" onclick="a = this.alt; this.alt=this.src; this.src=a; this.title = (this.title==\'On\' ? \'Off\' : \'On\');" title="Off" class="firegpg-sign">&nbsp;<span class="el" onclick="document.getElementById(\''+randId+'a\').onclick();">' + i18n.getString("GMailS") + '</span>&nbsp;|&nbsp;' +
                            '<img id="'+randId+'b" src="'+IMG_ENCRYPT_OFF+'" alt="'+IMG_ENCRYPT_ON+'" onclick="a = this.alt; this.alt=this.src; this.src=a; this.title = (this.title==\'On\' ? \'Off\' : \'On\');" title="Off" class="firegpg-encrypt" >&nbsp;<span class="el" onclick="document.getElementById(\''+randId+'b\').onclick();">' + i18n.getString("GMailC") + '</span>&nbsp;|&nbsp;' +
                            '<img id="'+randId+'c" src="'+IMG_INLINE_OFF+'" alt="'+IMG_INLINE_ON+'" onclick="a = this.alt; this.alt=this.src; this.src=a; this.title = (this.title==\'On\' ? \'Off\' : \'On\'); if (this.title==\'Off\') { document.getElementById(\''+randId+'att\').style.display = \'\'; } else { document.getElementById(\''+randId+'att\').style.display = \'none\'; }" title="Off" class="firegpg-inline" >&nbsp;<span class="el" onclick="document.getElementById(\''+randId+'c\').onclick();">' + i18n.getString("GmailI") + '</span>' +
                            '<span id="'+randId+'att">&nbsp;|&nbsp;<img id="'+randId+'d" src="'+IMG_ATTACHEMENTS_OFF+'" alt="'+IMG_ATTACHEMENTS_ON+'" onclick="a = this.alt; this.alt=this.src; this.src=a; this.title = (this.title==\'On\' ? \'Off\' : \'On\');" title="Off" class="firegpg-attachements" >&nbsp;<span class="el" onclick="document.getElementById(\''+randId+'d\').onclick();">' + i18n.getString("GmailA") + '</span></span>';

                            if (cGmail2.default_sign)
                                checkboxes.innerHTML += '<script>document.getElementById(\''+randId+'a\').onclick();</script>';

                            if (cGmail2.default_encrypt || (elements[0] && elements[0].hasAttribute("firegpg-encrypt-this-mail") && elements[0].getAttribute("firegpg-encrypt-this-mail") == "firegpg-encrypt-this-mail"))
                                checkboxes.innerHTML += '<script>document.getElementById(\''+randId+'b\').onclick();</script>';

                            if (cGmail2.default_inline)
                                checkboxes.innerHTML += '<script>document.getElementById(\''+randId+'c\').onclick();</script>';

                            if (cGmail2.default_attachements)
                                checkboxes.innerHTML += '<script>document.getElementById(\''+randId+'d\').onclick();</script>';

                            firegpgactions.appendChild(title);
                            firegpgactions.appendChild(checkboxes);
                            fileattachimage = tablebox.getElementsByClassName('en ed','img');

                            filesattachbox = fileattachimage[0].parentNode.parentNode;

                            try {
                                tablebox.firstChild.insertBefore(firegpgactions,filesattachbox);
                            } catch (e) {   fireGPGDebug(e,'cgmail2.checkDoc(insert checkboxes)',true); }

                            if (cGmail2.decryptOnReply) {

                                if (elements[0] && elements[0].hasAttribute("firegpg-decrypted-data") ) {
                                    data = elements[0].getAttribute("firegpg-decrypted-data");


                                    if (cGmail2.iframeOrTextarea(doc,wheretoadd) == "iframe") {

                                        var iframe = cGmail2.getTheIframe(doc,wheretoadd);

                                        baseData = iframe.contentWindow.document.body.innerHTML;

                                        before = baseData.substring(0,baseData.indexOf("-----BEGIN PGP MESSAGE-----"));

                                        after = baseData.substring(baseData.indexOf("-----END PGP MESSAGE-----") + "-----END PGP MESSAGE-----".length, baseData.length);

                                        iframe.contentWindow.document.body.innerHTML = before + data + after;

                                    } else {

                                        var textarea = cGmail2.getTheTextarea(doc,wheretoadd);

                                        baseData = textarea.value;

                                        before = baseData.substring(0,baseData.indexOf("-----BEGIN PGP MESSAGE-----"));

                                        after = baseData.substring(baseData.indexOf("-----END PGP MESSAGE-----") + "-----END PGP MESSAGE-----".length, baseData.length);

                                        textarea.value = before + data.replace(/<br \/>/gi, "\n> ") + after;

                                    }
                                }

                            }

                        }



                        form.setAttribute("firegpg-mail-id", "");
//fireGPGDebug('Setting mailid', 'ProbWithReplyForward');
                        if (elements[0]) {
                            form.setAttribute("firegpg-mail-id", elements[0].getAttribute("firegpg-mail-id"));
                            fireGPGDebug('to ' + elements[0].getAttribute("firegpg-mail-id"), 'ProbWithReplyForward');
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
//fireGPGDebug('Disable autosave ?', 'ProbWithReplyForward');
                        if (disable_autosave && form) // && form
                        {  fireGPGDebug('Disabling autosave', 'ProbWithReplyForward');

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



                                if (stackMatch(badpattern8, getValue.caller) || stackMatch(badpattern7, getValue.caller) || stackMatch(badpattern6, getValue.caller) || stackMatch(badpattern5, getValue.caller) || stackMatch(badpattern4, getValue.caller) || stackMatch(badpattern3, getValue.caller) || stackMatch(badpattern1, getValue.caller) || stackMatch(badpattern2, getValue.caller))
                                {
                                    function AutosaveWreckingBall() {};
                                    AutosaveWreckingBall.prototype.value = "Wrecked";
                                    AutosaveWreckingBall.prototype.toString = function() { return "[object AutosaveWreckingBall]"; }
                                    throw new AutosaveWreckingBall();
                                }
                                else
                                {
                                    // debugger; // keep this around for later usage when needing to adjust badpatterns
                                /*    dump(getValue.caller.name + " " +
				getValue.caller.caller.name + " " +
				getValue.caller.caller.caller.name + " " +
				getValue.caller.caller.caller.caller.name + " " +
				getValue.caller.caller.caller.caller.caller.name + " " +
				getValue.caller.caller.caller.caller.caller.caller.name + "\n\n");*/
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
                            var spanAS = form.ownerDocument.evaluate(".//div[contains(@class,'c1I77d')]//span[@class='x1Kcd']",
                                                                            form.parentNode.parentNode, null,
                                                                            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                            for (var o=0;o<spanAS.snapshotLength;o++)
                            {
                                spanAS.snapshotItem(o).innerHTML = i18n.getString("autosave-disabled");
                            }


                     } // end if autosave disabled




                        //End of code of Gmail S/MIME.


                    }
                }
                //END OF THE TEST FOR COMPOSE BUTTONS

                cGmail2.docOccuped[id] = false;

            }
        }
    },



    /*
        Function: callBack
        This function create a function witch is called when the user click on a button

        Parameters:
            doc - The document of the button.
    */
    callBack: function(doc) {

        this._doc = doc;

		this.handleEvent = function(event) { // Function in the function for handle... events.
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

            } catch (e)  { fireGPGDebug(e,'cgmail2.callBack',true);  } */


            if (target.hasAttribute('firegpg-ingore-this-event') && target.getAttribute('firegpg-ingore-this-event') == 'firegpg-ingore-this-event') {
                fireGPGDebug('event ingored', 'callBack');
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

            fireGPGDebug('Action: ' + target.getAttribute('gpg_action') + ' T:' + target, 'callBack');


       //If the user want to decrypt the mail (can use normal attibutes)
			if (target.innerHTML.indexOf(i18n.getString("GMailD")) == 0) {

                var tmpNode = target;


				var result = FireGPG.decrypt(false,target.parentNode.parentNode.getAttribute("firegpg-mail-to-decrypt"));

                if (target.parentNode.parentNode.hasAttribute("firegpg-parse-as-mime"))
                    result.decrypted  = FireGPGMimeDecoder.parseDecrypted(result.decrypted).message.replace(/<br \/>/gi, "\n");

                if (result.result == RESULT_SUCCESS)
					showText(result.decrypted,undefined,undefined,undefined,result.signresulttext);

			}     /*
			else if (target.getAttribute('gpg_action') == "sndsign" || target.getAttribute('gpg_action') == "sign")
			{

				var mailContent = cGmail2.getWriteMailContent(this._doc,target.parentNode);

				if (mailContent == "")
					return;

				var result = FireGPG.sign(false,gmailWrapping(mailContent));

                if (result.result == RESULT_SUCCESS) {

					cGmail2.setWriteMailContent(this._doc,target.parentNode,result.signed);

					if (target.getAttribute('gpg_action') == "sndsign")
						cGmail2.sendEmail(target.parentNode,this._doc);
				}

			}
            else if (target.getAttribute('gpg_action') == "sndpsign" || target.getAttribute('gpg_action') == "psign")
			{

				var mailContent = cGmail2.getWriteMailContent(this._doc,target.parentNode);

				if (mailContent == "")
					return;

				var result = FireGPG.sign(false,gmailWrapping(mailContent),null,null,true);

                if (result.result == RESULT_SUCCESS) {

					cGmail2.setWriteMailContent(this._doc,target.parentNode,result.signed);

					if (target.getAttribute('gpg_action') == "sndpsign")
						cGmail2.sendEmail(target.parentNode,this._doc);
				}

			}
			else if (target.getAttribute('gpg_action') == "sndcrypt" || target.getAttribute('gpg_action') == "crypt")
			{

				//This code has to mix with the previous else/if block
				var mailContent = cGmail2.getWriteMailContent(this._doc,target.parentNode);

				var whoWillGotTheMail = cGmail2.getToCcBccMail(this._doc,target.parentNode);

				if (mailContent == "")
					return;

                var result = FireGPG.crypt(false,mailContent,null, false, false,whoWillGotTheMail);

				if(result.result == RESULT_SUCCESS) {

					cGmail2.setWriteMailContent(this._doc,target.parentNode,result.encrypted);

					if (target.getAttribute('gpg_action') == "sndcrypt")
					{
						cGmail2.sendEmail(target.parentNode,this._doc);
					}

				}
			}
			else if (target.getAttribute('gpg_action') == "sndsigncrypt" || target.getAttribute('gpg_action') == "signcrypt")
			{

				//This code has to mix with the previous else/if block
				var mailContent = cGmail2.getWriteMailContent(this._doc,target.parentNode);

				var whoWillGotTheMail = cGmail2.getToCcBccMail(this._doc,target.parentNode);


				if (mailContent == "")
					return;

				var result = FireGPG.cryptAndSign(false, mailContent, null ,false,null, null, false, whoWillGotTheMail);

				// If the sign failled
				if(result.result == RESULT_ERROR_UNKNOW) {
					// We alert the user
					alert(i18n.getString("cryptAndSignFailed"));
				}
                else if(result.result == RESULT_ERROR_PASSWORD) {
					// We alert the user
					alert(i18n.getString("cryptAndSignFailedPass"));
				}
				else {

					cGmail2.setWriteMailContent(this._doc,target.parentNode,result.encrypted);

					if (target.getAttribute('gpg_action') == "sndsigncrypt")
					{
						cGmail2.sendEmail(target.parentNode,this._doc);
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

                var data = EnigConvertToUnicode(getBinContent("file://" + filePath), 'UTF-8');

                var whoWillGotTheMail = cGmail2.getToCcBccMail(this._doc,target.parentNode.parentNode.parentNode);

				if (data == "")
					return;

                errors = false;

                if (target.getAttribute('gpg_action') == "add_crypted") {

                    var result = FireGPG.crypt(false,data,null, false, true,whoWillGotTheMail);

                    if(result.result != RESULT_SUCCESS)
                        errors = true;

                } else {

                    // We get the result
                    var result = FireGPG.cryptAndSign(false, data, null ,false,null, null,true, whoWillGotTheMail);

                    if(result.result != RESULT_SUCCESS)
                        errors = true;

                }

                if (errors == false){

					var newData = result.encrypted;

                    var fileobj = getTmpDir();

                    fileobj.append( fp.file.leafName + ".asc");
                    fileobj.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

                    putIntoBinFile(fileobj.path,newData);


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

                var whoWillGotTheMail = cGmail2.getToCcBccMail(this._doc,buttonsboxes, false, false, false);

                if (inline) {

                    var mailContent = cGmail2.getWriteMailContent(this._doc,target.parentNode, true);



                    if (mailContent == "")
                        stopTheEvent = true;
                    else {

                        if (sign && encrypt) {

                            var result = FireGPG.cryptAndSign(false, mailContent, null ,false,null, null, false, whoWillGotTheMail);

                            // If the sign failled
                            if(result.result == RESULT_ERROR_UNKNOW) {
                                // We alert the user
                                alert(i18n.getString("cryptAndSignFailed"));
                                stopTheEvent = true;
                            }
                            else if(result.result == RESULT_ERROR_PASSWORD) {
                                // We alert the user
                                alert(i18n.getString("cryptAndSignFailedPass"));
                                stopTheEvent = true;
                            }
                            else if(result.result == RESULT_SUCCESS)  {

                                cGmail2.setWriteMailContent(this._doc,target.parentNode,result.encrypted);

                            } else {
                                stopTheEvent = true;
                            }


                        } else if (sign) {

                            var result = FireGPG.sign(false,gmailWrapping(mailContent));

                            if (result.result == RESULT_SUCCESS) {

                                cGmail2.setWriteMailContent(this._doc,target.parentNode,result.signed);

                            } else {

                                stopTheEvent = true;
                            }

                        } else if (encrypt) {

                            var result = FireGPG.crypt(false,mailContent,null, false, false,whoWillGotTheMail);

                            if(result.result == RESULT_SUCCESS) {
                                cGmail2.setWriteMailContent(this._doc,target.parentNode,result.encrypted);
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

                    cGmail2.setProgressMessage(f, i18n.getString("GmailCreatingMail"));



                    var children = buttonsboxes.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('goog-imageless-button-content');
                    a = new FireGPGGmailMimeSender(f, children[2], i18n);


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
                           cGmail2.useremail = topwinjs.USER_EMAIL;
                       }
                       else if (("GLOBALS" in topwinjs) && typeof(topwinjs.GLOBALS[10]) == "string" &&
                        (/@(g|google)mail.com$/i).test(topwinjs.GLOBALS[10]))
                       {
                           // gmail_fe_509_p10
                           cGmail2.useremail = topwinjs.GLOBALS[10];
                       }
                       else if (typeof(topwinjs.globals) == "object" && typeof(topwinjs.globals.USER_EMAIL) == "string")
                       {
                           cGmail2.useremail = topwinjs.globals.USER_EMAIL;
                       } else {

                           cGmail2.useremail = f.ownerDocument.evaluate(".//div[@class='a8']//b[contains(text(), '@')]",
                                                               f.ownerDocument.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE,
                                                               null).singleNodeValue.textContent;

                       }

                   } catch (e) { fireGPGDebug(e, 'finding smtp username', true);}


                    if (username == "") {
                         a.smtpUsername = cGmail2.useremail;
                    }

                    else
                        a.smtpUsername = username;


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

                    fireGPGDebug(a.smtpUsername, 'dbug-username');
                    fireGPGDebug(host, 'dbug-host');
                    fireGPGDebug(port, 'dbug-port');
                    fireGPGDebug(use_ssl, 'dbug-use_ssl');


                    from = cGmail2.getMailSender(this._doc,buttonsboxes);

                    if (from == "" || from == null)
                        from = cGmail2.useremail;



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


                    to = cGmail2.getToCcBccMail(this._doc,buttonsboxes, true);
                    cc= cGmail2.getToCcBccMail(this._doc,buttonsboxes, false, true);
                    bcc = cGmail2.getToCcBccMail(this._doc,buttonsboxes,  false, false, true);

                    subject = cGmail2.getMailSubject(this._doc,buttonsboxes);


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

                    var mailContent = cGmail2.getWriteMailContentForDirectSend(this._doc, buttonsboxes);

                    var inreplyTo = f.getAttribute("firegpg-mail-id");


                     prefs = new Object();

                    prefs.sign = sign;
                    prefs.encrypt = encrypt;
                    prefs.attachements = attachements;
                    prefs.whoWillGotTheMail = whoWillGotTheMail;
                    prefs.whoSendTheMail = cGmail2.extractMails(from);

                    resulta = false;

                   resulta = a.ourSubmit(from, to, cc, bcc, subject,
                    inreplyTo, "", mailContent, cGmail2.iframeOrTextarea(this._doc, buttonsboxes) == "textarea", attachments, prefs);


                    //DBUG
                    fireGPGDebug(from, 'dbug-from');
                    fireGPGDebug(to, 'dbug-to');
                    fireGPGDebug(cc, 'dbug-cc');
                    fireGPGDebug(bcc, 'dbug-bcc');
                    fireGPGDebug(subject, 'dbug-subject');

                   if (!resulta)
                    cGmail2.setProgressMessage(f, i18n.getString("GmailErrorMail"));
                   else
                    cGmail2.setProgressMessage(f, i18n.getString("GmailSendingMail"));

                    stopTheEvent = true;

                }




                if (stopTheEvent) {
                    event.stopPropagation();
                    fireGPGDebug('Canceling event', 'click on send');
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
                        data = Base64.decode(node.getAttribute('firegpg-file-content'),true);

                        break;

                    case 'encrypted':
                        eData = Base64.decode(node.getAttribute('firegpg-file-content'),true);

                        var result = FireGPG.decrypt(true,eData);

                        if (result.result == RESULT_ERROR_NO_GPG_DATA) {

                            var result = FireGPG.decrypt(true,eData, undefined, true);

                        }

                        if (result.result == RESULT_SUCCESS)
                            data = result.decrypted;

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
                        removeFile(filePath);
                        putIntoBinFile(filePath,data);

                }




            }
		};
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


            } catch (e) { fireGPGDebug(e,'cgmail2.addBouton',true);  }

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
                    tmpListener = new cGmail2.callBack(doc)
                    select.addEventListener('onchange',tmpListener,true);

               } catch (e) { fireGPGDebug(e,'cgmail2.addBouton2',true);  }

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
			 } catch (e) { fireGPGDebug(e,'cgmail2.sendEmail',true);  }

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

        if (betterTextOnly && cGmail2.iframeOrTextarea(dDocument,boutonxboxnode) == "iframe") {

            var i18n = document.getElementById("firegpg-strings");

            if (confirm(i18n.getString("betterToUsePlainText"))) {

                whereSeacrch =boutonxboxnode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

                children = whereSeacrch.getElementsByClassName('eo el', 'span');

                try {
                    var evt = dDocument.createEvent("MouseEvents");
                        evt.initEvent("click", true, true);
                        children[0].dispatchEvent(evt);
               } catch (e) { fireGPGDebug(e,'cgmail2.getWriteMailContent(settoplaintext)',true);  }

            }

        }

        if (cGmail2.iframeOrTextarea(dDocument,boutonxboxnode) == "iframe")
        {

            var iframe = cGmail2.getTheIframe(dDocument,boutonxboxnode);


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

                    if (cGmail2.noAutoReplyDetect) {

                        contenuMail =     Selection.wash(select);

                    } else {

                        var indexOfQuote = select.indexOf('<div class="gmail_quote">');

                        contenuMail = select.substring(0,indexOfQuote);

                        if (!forMime)
                            contenuMail =     Selection.wash(contenuMail);

                        if (indexOfQuote == -1 || TrimAndWash(contenuMail) == "")
                        {
                            indexOfQuote = select.length;
                            contenuMail = select.substring(0,indexOfQuote);

                            if (!forMime)
                                contenuMail =     Selection.wash(contenuMail);

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

                contenuMail = Selection.wash(str);

            }


        } else {

            var textarea = cGmail2.getTheTextarea(dDocument,boutonxboxnode);

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



                if (cGmail2.noAutoReplyDetect) {

                    contentu =  textarea.value;

                    textarea.selectionStart = 0;
                    textarea.selectionEnd = contentu.length;

                } else {

                    select2 = textarea.value;

                    var indexOfQuote = select2.indexOf("\n> ");
                    select2 = select2.substring(0,indexOfQuote);

                    indexOfQuote = select2.lastIndexOf("\n");

                    var contentu = select2.substring(0,indexOfQuote);

                    if (indexOfQuote == -1 || TrimAndWash(contentu) == "")
                    {
                        select2 = textarea.value;
                        indexOfQuote = select2.length;

                        var contentu = select2.substring(0,indexOfQuote);
                    }

                    textarea.selectionStart = 0;
                    textarea.selectionEnd = indexOfQuote;

                }

                contenuMail = Selection.wash(contentu);
            }
            else
            {

                contenuMail = Selection.wash(select2);
            }


        }

        //Remove stranges A0
        var reg=new RegExp(unescape('%A0'), "gi");
        contenuMail = contenuMail.replace(reg," ");


        return contenuMail;
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



        if (cGmail2.iframeOrTextarea(dDocument,boutonxboxnode) == "iframe")
        {

            var iframe = cGmail2.getTheIframe(dDocument,boutonxboxnode);

            texte = iframe.contentWindow.document.body.innerHTML;

            var reg=new RegExp("<script[^>]*>[^<]*</script[^>]*>", "gi"); //Élimination des scripts
            texte = texte.replace(reg,"\n");

            var reg=new RegExp("<script[^>]*>[^<]*</script>", "gi"); //Élimination des scripts
            texte = texte.replace(reg,"\n");

            var reg=new RegExp("<script>[^<]*</script>", "gi"); //Élimination des scripts
            texte = texte.replace(reg,"\n");

            return texte;


        } else {

            var textarea = cGmail2.getTheTextarea(dDocument,boutonxboxnode);

            return textarea.value.replace(/\r\n/gi, "\n").replace(/\r/gi, "\n").replace(/\n/gi, "\r\n");


        }
	},

    /*
        Function: iframeOrTextarea
        Return iframe if the iframe is used to compose the mail, textarea if not.

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    iframeOrTextarea: function(dDocument,boutonxboxnode) {

        var iframe = cGmail2.getTheIframe(dDocument,boutonxboxnode);
        var textarea = cGmail2.getTheTextarea(dDocument,boutonxboxnode);

        if (iframe == null || iframe.parentNode == undefined)
            return "textarea";

        if (textarea == null || textarea.parentNode == undefined)
            return "iframe";

        var style = iframe.parentNode.getAttribute('style');

        if (style.indexOf('display: none;') != -1)
            return "textarea";

        return "iframe";


    },

    /*
        Function: getTheIframe
        Return the iframe used to compose a mail

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    getTheIframe: function(dDocument,boutonxboxnode) {



        var i = dDocument.evaluate(".//td[contains(@class, 'd7')]//iframe", boutonxboxnode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        fireGPGDebug(i, 'iframefound');

        return i;

        /*var tmp = boutonxboxnode;

        tmp = tmp.parentNode;

        tmp = tmp.childNodes[1];

        //29 septebmre 2008
        if (!tmp) {

             var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];

        }

        if (!tmp) { //Version du 29 octobre 2008 - BOUTONS DU BAS

            var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

           tmp = tmp.childNodes[1];

        }

        tmp = tmp.firstChild;

        tmp = tmp.childNodes[2];

        if (!tmp) { //Version du 29 octobre 2008

            var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];

            tmp = tmp.firstChild;

            tmp = tmp.childNodes[2];

        }

        tmp = tmp.childNodes[1];

        tmp = tmp.getElementsByTagName('iframe');

        tmp = tmp[0];

        return tmp;*/


    },

    /*
        Function: getTheTextarea
        Return the textarea used to compose a mail

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    getTheTextarea: function(dDocument,boutonxboxnode) {

        var i = dDocument.evaluate(".//td[contains(@class, 'd7')]//textarea", boutonxboxnode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        fireGPGDebug(i, 'textareadfound');

        return i;

        /*var tmp = boutonxboxnode;

        tmp = tmp.parentNode;

        tmp = tmp.childNodes[1];

         //29 septebmre 2008
        if (!tmp) {

            var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];

        }

        if (!tmp) { //Version du 29 octobre 2008 - BOUTONS DU BAS

            var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

           tmp = tmp.childNodes[1];

        }

        tmp = tmp.firstChild;

        tmp = tmp.childNodes[2];

        if (!tmp) { //Version du 29 octobre 2008 - BOUTONS DU HAUT

            var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];

            tmp = tmp.firstChild;

            tmp = tmp.childNodes[2];

        }

        tmp = tmp.childNodes[1];

        tmp = tmp.getElementsByTagName('textarea');

        tmp = tmp[0];

        return tmp; */

    },

    /*
        Function: getToCcBccMail
        Return the To, CC and BCC filds' value of a mail in composition.

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
	getToCcBccMail: function(dDocument,boutonxboxnode, onlyto, onlycc, onlybcc) {
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




		return cGmail2.extractMails(forWho);
	},

    extractMails: function(forWho) {

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

    },

    /*
    */

    getMailSender: function(dDocument,boutonxboxnode) {

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





    },

        getMailSubject: function(dDocument,boutonxboxnode) {

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




        if (cGmail2.iframeOrTextarea(dDocument,boutonxboxnode) == "iframe")
        {

            var iframe = cGmail2.getTheIframe(dDocument,boutonxboxnode);


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

                if (cGmail2.noAutoReplyDetect)
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

            var textarea = cGmail2.getTheTextarea(dDocument,boutonxboxnode);

            var startPos = textarea.selectionStart;
            var endPos = textarea.selectionEnd;
            var chaine = textarea.value;

            // We create the new string and replace it into the focused element
            textarea.value = chaine.substring(0, startPos) + newText + chaine.substring(endPos, chaine.length);

            // We select the new text.
            textarea.selectionStart = startPos;
            textarea.selectionEnd = startPos + newText.length ;

        }


	},


    /*
        Function: getMailContent
        Retrun the content of a mail, need the div object with the mail

        Parameters:
            i - The mail node
            doc - The document of the page.
    */
	getMailContent: function(i,doc) {
		var contenuMail = i;
		var range = doc.createRange();
		range.selectNode(contenuMail);
		var documentFragment = range.cloneContents();
		var s = new XMLSerializer();
		var d = documentFragment;
		var str = s.serializeToString(d);
		contenuMail = Selection.wash(str);


        //Remove stranges A0
        var reg=new RegExp(unescape('%A0'), "gi");
        contenuMail = contenuMail.replace(reg," ");

		return contenuMail;

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

        var i = papai.getElementsByClassName("ii gt");
        i = i[0];

		baseData = i.innerHTML;

        fireGPGDebug(baseData);

        before = baseData.substring(0,baseData.indexOf("-----BEGIN PGP MESSAGE-----"));

        end = baseData.indexOf("-----END PGP MESSAGE-----") + "-----END PGP MESSAGE-----".length;

        if (end ==( "-----END PGP MESSAGE-----".length -1))
            end = baseData.indexOf('<a class="vem"');

        after = baseData.substring(end, baseData.length);


        img = "<img src=\""+IMG_ENCRYPTED+"\" alt=\"" +IMG_ENCRYPTED2+"\" onmouseout=\"a = this.alt; this.alt=this.src; this.src=a; this.title = ''; \" onmouseover=\"if (this.title == '') { a = this.alt; this.alt=this.src; this.src=a; this.title = 'FireGPG'; }\">";

        data = data.replace(/<br \/>/gi, '<br/>');
        data = data.replace(/ /gi, '&nbsp;');

        i.innerHTML = before + img + "<br /><br />" + data + "<br /><br />" + img  +  after;

	},

    /*//On détruit tous les documents.
    listenerUnload: function () {



    },*/

    /*
        Function: initSystem
        This function init the class : she load specific options, and attach listeners to the webpages.
    */
    initSystem: function() {

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
                document.getElementById("appcontent").addEventListener("DOMContentLoaded", cGmail2.pageLoaded, false);
            else
                document.getElementById("browser_content").addEventListener("DOMContentLoaded", cGmail2.pageLoaded, false);
			//window.addEventListener("unload", function() {cGmail2.listenerUnload()}, false);

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


			cGmail2.b_sign = b_sign;
			cGmail2.b_sign_s = b_sign_s;
            cGmail2.b_psign = b_psign;
			cGmail2.b_psign_s = b_psign_s;
			cGmail2.b_crypt = b_crypt;
			cGmail2.b_crypt_s = b_crypt_s;
			cGmail2.b_signcrypt = b_signcrypt;
			cGmail2.b_signcrypt_s = b_signcrypt_s;
            cGmail2.b_use_select_s = b_use_select_s; */

            cGmail2.nonosign = nonosign;

            try {	var default_sign = prefs.getBoolPref("gmail_select_by_default_sign");	}
			catch (e) { var default_sign = false; }

            try {	var default_encrypt = prefs.getBoolPref("gmail_select_by_default_encrypt");	}
			catch (e) { var default_encrypt = false; }

            try {	var default_inline = prefs.getBoolPref("gmail_select_by_default_inline");	}
			catch (e) { var default_inline = false; }

            try {	var default_attachements = prefs.getBoolPref("gmail_select_by_default_attachements");	}
			catch (e) { var default_attachements = false; }

            cGmail2.default_sign = default_sign;
			cGmail2.default_encrypt = default_encrypt;
			cGmail2.default_inline = default_inline;
            cGmail2.default_attachements = default_attachements;


            try {	var noAutoDecrypt = prefs.getBoolPref("gmail_disable_auto_decryption");	}
			catch (e) { var noAutoDecrypt = false; }
            cGmail2.noAutoDecrypt = noAutoDecrypt;

            try {	var noAutoReplyDetect = prefs.getBoolPref("gmail_disable_detection_of_reply_for_signs");	}
			catch (e) { var noAutoReplyDetect = false; }
            cGmail2.noAutoReplyDetect = noAutoReplyDetect;

            try {	var decryptOnReply = prefs.getBoolPref("gmail_decrypt_when_reply");	}
			catch (e) { var decryptOnReply = false; }
            cGmail2.decryptOnReply = decryptOnReply;

            try {	var showUserInfo = prefs.getBoolPref("gmail_show_user_info_for_signs");	}
			catch (e) { var showUserInfo = false; }
            cGmail2.showUserInfo = showUserInfo;

            try {	var encryptIfDecrypted = prefs.getBoolPref("gmail_keep_encrypted_mail");	}
			catch (e) { var encryptIfDecrypted = false; }
            cGmail2.encryptIfDecrypted = encryptIfDecrypted;




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



        final_location = doc.location.href;

        var regrex = new RegExp('^https?://mail.google.com/a/[a-zA-Z-.0-9]*');

        final_location = final_location.replace(regrex, "http://mail.google.com/mail");

    fireGPGDebug(final_location);

        //Find IK
        if (final_location.indexOf("http://mail.google.com/mail/?ui=2&ik=") == 0 || final_location.indexOf("https://mail.google.com/mail/?ui=2&ik=") == 0) {

            var tmp_string = final_location.substring(final_location.indexOf("&ik=") + 4, final_location.length);
            var ik = tmp_string.substring(0, tmp_string.indexOf('&'));

            cGmail2.ik = ik;

            fireGPGDebug("ik:" + ik);

        }

        //Fing base url
        if ((final_location.indexOf("http://mail.google.com/mail/?ui=2") == 0 || final_location.indexOf("https://mail.google.com/mail/?ui=2") == 0)) {

            cGmail2.baseUrl = doc.location.href.substring(0, doc.location.href.indexOf("?ui=2"));
fireGPGDebug("baseurl:" + cGmail2.baseUrl);
        }

        //Add windowopen rewriter
        if (final_location.indexOf("http://mail.google.com/mail/") == 0 || final_location.indexOf("https://mail.google.com/mail/") == 0) {

           sr = doc.createElement('script');
            sr.innerHTML = "var windowopen_ = window.open; window.open = function (a,b,c) {  if (document.getElementById('canvas_frame') && document.getElementById('canvas_frame').contentDocument && document.getElementById('canvas_frame').contentDocument.body && document.getElementById('canvas_frame').contentDocument.body.getAttribute('firegpg') != null &&document.getElementById('canvas_frame').contentDocument.body.getAttribute('firegpg').indexOf('#FIREGPGCAPTURE') != -1) { document.getElementById('canvas_frame').contentDocument.body.setAttribute('firegpg',a); return new Window();  } else { return windowopen_(a,b,c); }};"
fireGPGDebug("try to add");
            if (doc) {
            doc.body.appendChild(sr);
            fireGPGDebug("added");
            }



        }





        //http://mail.google.com/mail/?ui=2&ik=8e7a8837c3&

        if (final_location.indexOf(GMAIL_MAIN_DOC_URL) == 0 || final_location .indexOf(GMAIL_MAIN_DOC_URL2) == 0) {
fireGPGDebug("activated");

            doc.getElementsByClassName = function(className, tag) {

            if (tag == undefined)
                tag = "*"

            className = " " + className + " "

            var elts =  doc.getElementsByTagName(tag);

            var classArray = new Array();

            for (var j = 0; j < elts.length; ++j) {

                lf = "  " + elts[j].className + " "

                if (lf.indexOf(className) > 0) {

                        classArray.push(elts[j]);
                    }
                }

                return classArray;

            };




            cGmail2.current = cGmail2.current + 1;

            cGmail2.doc[cGmail2.current] = doc;

            /*var tmpListener = new Object;
            tmpListener = null;
            tmpListener = new cGmail2.clickOnDock(cGmail2.current)
            doc.addEventListener('mousedown',tmpListener,true);*/

            var tmpListener = new Object;
            tmpListener = null;
            tmpListener = new cGmail2.whenNodeIsInsered(cGmail2.current)
            doc.addEventListener('DOMNodeInserted',tmpListener,true);



            //setTimeout("cGmail2.checkDoc("+cGmail2.current+")", 5000);

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

            if (cGmail2.docOccuped[this._docid] == undefined || cGmail2.docOccuped[this._docid] == false)
            {

                setTimeout("cGmail2.checkDoc("+this._docid+")", 5000);
                cGmail2.docOccuped[this._docid] = true;
            }


        }


    },

    whenNodeIsInsered: function(docid) {

        this._docid = docid;

        //
        this.handleEvent = function(event) {

          //fireGPGDebug(event.target.className, 'Nodeinsersed');

            if (event.target && event.target.className &&
                (event.target.className == "HprMsc" || event.target.className.indexOf("y4Wv6d") != -1 || event.target.className == "XoqCub" ||//load old mail | compose | Mail widnow
                 event.target.className.indexOf("HprMsc") != -1 || event.target.className.indexOf("CoUvaf") != -1 || event.target.className.indexOf("T1HY1") != -1) &&  //load old mail2 | compose2 | Mail widnow2
                (cGmail2.docOccuped[this._docid] == undefined || cGmail2.docOccuped[this._docid] == false))
            {
                fireGPGDebug("Captured !");

                setTimeout("cGmail2.checkDoc("+this._docid+")", 0);
                 cGmail2.docOccuped[this._docid] = true;

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

        fireGPGDebug('Starting get content', 'getMimeMailContens');

        var elements = id.parentNode.getElementsByTagName("img");

        actionbox = "";

        //On cherche la boite avec les boutons
        for (var j = 0; j < elements.length; j++) {
            if (elements[j].getAttribute("class") == "hA") {
                actionbox = elements[j].parentNode;
                break;
            }
        }

        fireGPGDebug('Actionbox is ' + actionbox, 'getMimeMailContens');



         //This is a ugly hack.
        var evt = doc.createEvent("MouseEvents");
         evt.initMouseEvent("click", true, true, window,
           0, 0, 0, 0, 0, false, false, false, false, 0, null);

        var scollage = doc.documentElement.scrollTop;
        var a = actionbox.dispatchEvent(evt);
        doc.documentElement.scrollTop = scollage;

        fireGPGDebug('Event dispatech (click) is ' + a, 'getMimeMailContens');

       //On choppe le bouton en question
       //CHILDREN OF zWKgkf
       // act="32"

        papa = doc.getElementsByClassName('gv');
        papa = papa[0];

        fireGPGDebug('Papa is ' + papa, 'getMimeMailContens');

        for (var j = 0; j < papa.childNodes.length; j++) {
            if (papa.childNodes[j].getAttribute("act") == "32") {
                detailsElement = papa.childNodes[j];
                break;
            }
        }

        fireGPGDebug('detailsElement is ' + detailsElement, 'getMimeMailContens');

        doc.body.setAttribute('firegpg',"#FIREGPGCAPTURE");

        var evt3 = doc.createEvent("MouseEvents");
         evt3.initMouseEvent("mouseup", true, true, window,
           0, 0, 0, 0, 0, false, false, false, false, 0, null);

         var scollage = doc.documentElement.scrollTop;
         detailsElement.dispatchEvent(evt3);
         doc.documentElement.scrollTop = scollage;

        url = doc.body.getAttribute('firegpg');

        fireGPGDebug('Url get is ' + url, 'getMimeMailContens');

        if (url == "#FIREGPGCAPTURE" ) {
            //Close popup
             var evt4 = doc.createEvent("MouseEvents");
            evt4.initMouseEvent("mousedown", true, true, window,
             0, 0, 0, 0, 0, false, false, false, false, 0, null);

            var scollage = doc.documentElement.scrollTop;
            actionbox.dispatchEvent(evt4);
            doc.documentElement.scrollTop = scollage;

            fireGPGDebug('Waiting mode', 'getMimeMailContens');
            return "{ERROR,WAIT}";

        }

        doc.body.setAttribute('firegpg',"");

        fireGPGDebug('baseUrl is ' + cGmail2.baseUrl, 'getMimeMailContens');

		if (this.messageCache == null || this.messageCache[url] == null)
		{
            //getContentXHttp
            data = getBinContent(cGmail2.baseUrl + url , 5000*1024);

     //       fireGPGDebug('data1 is ' + data, 'getMimeMailContens');

            if (data == "{MAX}") {

                var i18n = document.getElementById("firegpg-strings");

				if (confirm(i18n.getString("GmailBigMail")))
                    data = getBinContent(cGmail2.baseUrl + url );
                else
                    return '';

       //         fireGPGDebug('data2 is ' + data, 'getMimeMailContens');

            }

      //      fireGPGDebug('finaldata is ' + data, 'getMimeMailContens');


			var mailData = EnigConvertToUnicode(data , 'UTF-8');

        //    fireGPGDebug('mailData is ' + mailData, 'getMimeMailContens');
            // getContentXHttp(cGmail2.baseUrl + url);

			if (this.messageCache == null)
				this.messageCache = { };

			//this.messageCache[url ] = mailData;

			return mailData;
		}
		else
		{
			return this.messageCache[url ];
		}

    },


    setProgressMessage: function(form, text)
{
	try
	{
		// already closed (this also means that local variables like jsdump are probably unavailable)
		if (!form.ownerDocument.defaultView) return;
		// all that's needed is the form...we can go from there
		var t = form.ownerDocument.defaultView.top;
		var d = t.document;
		const F = XPathResult.FIRST_ORDERED_NODE_TYPE;

		var jH = d.evaluate("div[contains(@class, 'vY nq')]", d.body, null, F, null).singleNodeValue;
		// used to have div[@class='jHZvnc'] but should be div[contains(@class, 'jHZvnc')], so moved around
		var IY	= d.evaluate(".//div[@class='no']", jH, null, F, null).singleNodeValue;
		var wT	= d.evaluate("div/div[contains(@class,'nH')]", IY, null, F, null).singleNodeValue;
		if (!wT) wT = d.evaluate("div/div[contains(@class,'QShok')]", IY, null, F, null).singleNodeValue;
		if (text == null)
		{
			wT.parentNode.style.display = "none";
			return;
		}

		wT.parentNode.style.display = "";
		stUtil.removeClassName(jH, "WBnLQb");

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
		fireGPGDebug(e, "cGmail2.setProgressMessage", true);
	}
} // end setProgressMessage

};



// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
