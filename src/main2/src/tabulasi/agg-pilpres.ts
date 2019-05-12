import { PageParam, getSumValue } from "./common";
import { HierarchyNode } from "./types";
import { ScreenSize } from "./screen";

const THRESHOLD_PERCENTAGE = 0.8

function estimasiStyleFn(cakupan: number, pending: number, ntps: number): string {
    let pEstimasi = (cakupan - pending) / ntps * 100
    let pCakupan = cakupan / ntps * 100
    return `background-image: linear-gradient(to right, #aed581 0, #aed581 ${pEstimasi}%, #fff176 ${pEstimasi}%, #fff176 ${pCakupan}%, #e0e0e0 ${pCakupan}%, #e0e0e0 100%)`
}

export class AggPilpresRenderer {
    constructor(private screenSize: ScreenSize) {
    }

    render(param: PageParam, node: HierarchyNode): string {
        var s = ''
        s += '<table class="table">'

        s += '<tr class="header">'
        s += '<td class="idx">#</td>'
        s += '<td class="name">Wilayah</td>'
        s += '<td class="sum pas1">Jokowi-Amin</td>'
        s += '<td class="sum pas2">Prabowo-Sandi</td>'
        if (this.screenSize.is('phone'))
            s += '<td class="tps estimasi">Est. TPS</td>'
        else
            s += '<td class="tps estimasi">Estimasi TPS</td>'
        s += '</tr>'

        var total: any = {
            ntps: 0,
            cakupan: 0,
            pending: 0,
            pas1: 0,
            pas2: 0,
        }

        let F = (n: number) => n.toLocaleString('id')

        for (var i = 0; i < node.children.length; i++) {
            let ch = node.children[i]
            let id = ch[0]
            let data = node.data[id]
            let sum = data.sum
            let url = '#' + param.type + ':' + id

            let S = (key: string) => getSumValue(sum, key)
            let FS = (key: string) => F(S(key))

            let name = ch[1]
            let ntps = ch[2]
            let tpsEstimasiRaw = (sum.cakupan - sum.pending) / ntps
            let tpsEstimasi = (Math.round(tpsEstimasiRaw * 1000) / 10).toLocaleString('id')
            let estimasiStyle = estimasiStyleFn(sum.cakupan, sum.pending, ntps)

            total.ntps += ch[2]
            total.cakupan += sum.cakupan
            total.pending += sum.pending
            total.pas1 += sum.pas1
            total.pas2 += sum.pas2

            let pas1 = S('pas1')
            let pas2 = S('pas2')
            let pas1p = pas1 / (pas1 + pas2)
            let pas1p10000 = Math.round(10000 * pas1p)
            let pas2p10000 = 10000 - pas1p10000
            let pwin: any = {
                pas1: pas1p > 0.5,
                pas2: pas1p < 0.5,
            }
            let pasp: any = {
                pas1: (pas1p10000 / 100).toLocaleString('id') + '%',
                pas2: (pas2p10000 / 100).toLocaleString('id') + '%',
            }

            let showPercentage = tpsEstimasiRaw >= THRESHOLD_PERCENTAGE
            // let estTotal = Math.round((pas1 + pas2) / tpsEstimasiRaw)
            // let estSisa = estTotal - pas1 - pas2
            // if (pas1 < pas2 && pas1 + estSisa < pas2) showPercentage = true
            // if (pas2 < pas1 && pas2 + estSisa < pas1) showPercentage = true

            let P = (p: string): string => {
                let per = showPercentage ? 'per' : ''
                let win = pwin[p] ? 'win' : ''
                let s = ''
                s += `<td class="sum pas ${p} ${per} ${win}">`
                s += `<span class="abs">${FS(p)}</span>`
                if (showPercentage)
                    s += `<span class="per">${pasp[p]}</span>`
                s += '</td>'
                return s
            }

            s += '<tr class="row">'
            s += `<td class="idx">${i + 1}</td>`
            s += `<td class="name darken"><a href="${url}">${name}</a></td>`
            s += P('pas1')
            s += P('pas2')
            s += `<td class="tps estimasi"><span style="${estimasiStyle}">${tpsEstimasi}%</span></td>`
            s += '</tr>'
        }

        // total
        let tpsEstimasiRaw = (total.cakupan - total.pending) / total.ntps
        let tpsEstimasi = (Math.round(tpsEstimasiRaw * 1000) / 10).toLocaleString('id')
        let estimasiStyle = estimasiStyleFn(total.cakupan, total.pending, total.ntps)

        s += '<tr class="footer">'
        s += '<td class="idx"></td>'
        s += '<td class="name">Total</td>'
        s += `<td class="sum pas pas1">${F(total.pas1)}</td>`
        s += `<td class="sum pas pas2">${F(total.pas2)}</td>`
        s += `<td class="tps estimasi"><span style="${estimasiStyle}">${tpsEstimasi}%</span></td>`
        s += '</tr>'

        s += '</table>'

        return s
    }
}