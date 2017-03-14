// @flow

import _ from 'lodash'
import * as d3 from 'd3'

export default class Bounds {
	x: number
	y: number
	width: number
	height: number

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
	}

	static fromProps(props: { x: number, y: number, width: number, height: number }): Bounds {
		const { x, y, width, height } = props
		return new Bounds(x, y, width, height)
	}

	static fromBBox(bbox : { x: number, y: number, width: number, height: number }) : Bounds {
		return this.fromProps(bbox)		
	}

	static empty() : Bounds {
		return new Bounds(0,0,0,0)
	}

	static textBoundsCache : Map<string, Bounds>
	static ctx : any
	static baseFontSize : number

	static forText(str: string, { x = 0, y = 0, fontSize = '1em' }: { x?: number, y?: number, fontSize?: string|number } = {}): Bounds {
		this.textBoundsCache = this.textBoundsCache || new Map()
		this.ctx = this.ctx || document.createElement('canvas').getContext('2d')
		this.baseFontSize = this.baseFontSize || parseFloat(d3.select('svg').style('font-size'))

		if (_.isNumber(fontSize))
			fontSize = fontSize + 'px'
		else if (_.includes(fontSize, 'em'))
			fontSize = this.baseFontSize*parseFloat(fontSize)+'px'

		const key = str+'-'+fontSize
		const fontFace = "Arial"

		let bounds = this.textBoundsCache.get(key)
		if (bounds) return bounds

	    this.ctx.font = fontSize + ' ' + fontFace;
		const m = this.ctx.measureText(str)

		/*const update = d3.select('svg').selectAll('.tmpTextCalc').data([str]);

		const text = update.enter().append('text')
			.attr('class', 'tmpTextCalc')
			.attr('opacity', 0)
			.merge(update)
  			  .attr('font-size', fontSize)
			  .text(function(d) { return d; });*/

		const height = str == "m" ? m.width : Bounds.forText("m", { fontSize: fontSize }).height
		bounds = new Bounds(x, y-height, m.width, height).padWidth(-1).padHeight(-1)

		this.textBoundsCache.set(key, bounds)
		return bounds
	}

	static debug(bounds : Bounds[], containerNode = null) {
		var container = containerNode ? d3.select(containerNode) : d3.select('svg');

		container.selectAll('rect.boundsDebug').remove()

		container.selectAll('rect.boundsDebug')
			.data(bounds).enter()
			.append('rect')
				.attr('x', b => b.left)
				.attr('y', b => b.top)
				.attr('width', b => b.width)
				.attr('height', b => b.height)
				.attr('class', 'boundsDebug')
				.style('fill', 'rgba(0,0,0,0)')
				.style('stroke', 'red');

	}


	get left(): number { return this.x }
	get top(): number { return this.y }
	get right(): number { return this.x+this.width }
	get bottom(): number { return this.y+this.height }

	padLeft(amount: number): Bounds {
		return new Bounds(this.x+amount, this.y, this.width-amount, this.height)
	}

	padRight(amount: number): Bounds {
		return new Bounds(this.x, this.y, this.width-amount, this.height)
	}

	padBottom(amount: number): Bounds {
		return new Bounds(this.x, this.y, this.width, this.height-amount)		
	}

	padTop(amount: number): Bounds {
		return new Bounds(this.x, this.y+amount, this.width, this.height-amount)
	}

	padWidth(amount: number): Bounds {
		return new Bounds(this.x+amount, this.y, this.width-amount*2, this.height)
	}

	padHeight(amount: number): Bounds {
		return new Bounds(this.x, this.y+amount, this.width, this.height-amount*2)
	}

	pad(amount: number): Bounds {
		return new Bounds(this.x+amount, this.y+amount, this.width-amount*2, this.height-amount*2)
	}

	extend(props: { x?: number, y?: number, width?: number, height?: number }): Bounds {
		return Bounds.fromProps(_.extend({}, this, props))
	}

	scale(scale: number): Bounds {
		return new Bounds(this.x*scale, this.y*scale, this.width*scale, this.height*scale)
	}

	intersects(otherBounds: Bounds): boolean {
		const r1 = this, r2 = otherBounds

	    return !(r2.left > r1.right || r2.right < r1.left || 
             r2.top > r1.bottom || r2.bottom < r1.top)
	}

	containsPoint(x : number, y : number) : boolean {
		return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom
	}

	toCSS() : { left: string, top: string, width: string, height: string } {
		return { left: this.left+'px', top: this.top+'px', width: this.width+'px', height: this.height+'px'}
	}
	
	xRange() : [number, number] {
		return [this.left, this.right]
	}

	yRange() : [number, number] {
		return [this.bottom, this.top]
	}
}

