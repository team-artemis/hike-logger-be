class TrailsController < ApplicationController
  before_action :set_trail, only: [:show, :edit, :update, :destroy]
  include TrailsHelper

  # GET /trails
  # GET /trails.json
  def index
    @trails = Trail.all
    @geojson = Array.new
    build_geojson(@trails, @geojson)

    respond_to do |format|
      format.html
      format.json { render json: @geojson }
    end
  end
  # Refactor to trails_helper?
  def build_geojson(trails, geojson)
    trails.each do |trail|
      geojson << GeojsonBuilder.build_trail_point(trail)
    end
  end

  # GET /trails/1
  # GET /trails/1.json
  def show
    @trail = set_trail
  end

  # GET /trails/new
  def new
    @trail = Trail.new
  end

  # GET /trails/1/edit
  def edit
    @trail = set_trail
    @trail.update_attributes(trail_params)
    redirect_to user_trail_path(@trail)
  end

  # POST /trails
  # POST /trails.json
  def create
    @trail = Trail.new(trail_params)

    respond_to do |format|
      if @trail.save
        format.html { redirect_to @trail, notice: 'Trail was successfully created.' }
        format.json { render :show, status: :created, location: @trail }
      else
        format.html { render :new }
        format.json { render json: @trail.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /trails/1
  # PATCH/PUT /trails/1.json
  def update
    respond_to do |format|
      if @trail.update(trail_params)
        format.html { redirect_to @trail, notice: 'Trail was successfully updated.' }
        format.json { render :show, status: :ok, location: @trail }
      else
        format.html { render :edit }
        format.json { render json: @trail.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /trails/1
  # DELETE /trails/1.json
  def destroy
    @trail.destroy
    respond_to do |format|
      format.html { redirect_to trails_url, notice: 'Trail was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_trail
      @trail = Trail.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def trail_params
      params.require(:trail).permit(:title, :length, :duration, :difficulty, :review, :rating)
    end
end
