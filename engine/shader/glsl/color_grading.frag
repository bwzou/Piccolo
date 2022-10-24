#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp float _COLORS      = float(lut_tex_size.y);

    highp vec4 color       = subpassLoad(in_color).rgba;

    highp vec2 lut_size = vec2(lut_tex_size.x, lut_tex_size.y);

    // 求2d贴图方格的数量
    highp float block_num = lut_size.x / lut_size.y;

    // 求出b值所在位置
    highp float left_block_index = floor(block_num * color.b);
    highp float right_block_index = ceil(block_num * color.b);

    // 计算b值左右对应像素的u值并归一化
    highp float u_l = (left_block_index * lut_size.y + lut_size.y * color.r) / lut_size.x;
    highp float u_r = (right_block_index * lut_size.y + lut_size.y * color.r) / lut_size.x;

    // 求出v值
    highp float lut_coor_y = color.g;

    // 计算b值左右对应像素的位置
    highp vec2 left_lut_coord = vec2(u_l, lut_coor_y);
    highp vec2 right_lut_coord = vec2(u_r, lut_coor_y);

    // 计算b值左右对应像素的颜色值
    highp vec4 left_lut_color = texture(color_grading_lut_texture_sampler, left_lut_coord);
    highp vec4 right_lut_color = texture(color_grading_lut_texture_sampler, right_lut_coord);
    
    // 获取权重
    // fract(x) = x - floor(x)
    highp float weight = fract(color.b * lut_size.y);

    // 对采样结果进行插值
    // mix(x, y, level) = x * (1 - level) + y * level;
    out_color = mix(left_lut_color, right_lut_color, weight);
}
