class Array
  def self.fill2d(rows, cols, value)
    arr = Array.new(rows)
    (0...rows).each { |i|
      arr[i] = Array.new(cols, value)
    }
    arr
  end
end

class Random
  alias_method :old_rand, :rand

  def rand(a = nil, b = nil)
    if a.nil?
      old_rand
    elsif b.nil? && a.respond_to?(:to_a)
      arr = a.to_a
      arr[old_rand(arr.count)]
    elsif b.nil?
      old_rand(a)
    else
      old_rand(b - a) + a
    end
  end
end

#noinspection RubyResolve
class Sudoku
  DIFFICULTY_SPACES = {
      easy:   (35...45),
      medium: (30...35),
      hard:   (25...30),
  }

  def initialize
    @rand        = Random.new
    @sudoku      = []
    @full_sudoku = []
  end

  def generate_difficulty(difficulty)
    generate(@rand.rand(DIFFICULTY_SPACES[difficulty]))
  end

  def generate(cells = 81, max_tries = 100000)
    @full_sudoku = generate_grid
    tried_inds   = []
    tries        = 0
    time1        = Time::now
    while tries < max_tries
      tries += 1
      while get_number_spots > cells && tried_inds.count < 81
        begin
          i = @rand.rand(81)
        end while (tried_inds.include?(i) || @sudoku[i] == 0)
        tried_inds << i
        old_value        = @sudoku[i].value
        @sudoku[i].value = 0
        @sudoku[i].value = old_value unless sudoku_unique?
      end
      return tries, true, (Time::now - time1) if get_number_spots == cells
    end
    self.data = @full_sudoku
    return tries, false, (Time::now - time1)
  end

  def generate_grid
    clear
    squares   = Array.new(81, nil)
    available = []
    81.times { available << (1..9).to_a }
    c = 0
    until c == 81
      if available[c].count > 0
        i = @rand.rand(available[c].count)
        z = available[c][i]
        if conflicts?(squares, item(c, z))
          available[c].delete_at(i)
        else
          squares[c] = item(c, z)
          available[c].delete_at(i)
          c += 1
        end
      else
        available[c] = (1..9).to_a
        squares[c-1] = nil
        c            -= 1
      end
    end
    squares.each { |v| @sudoku << v }
    data
  end

  def clear
    @sudoku      = []
    @full_sudoku = []
  end

  def get_cell_rc(row, col)
    @sudoku[row * 9 + col]
  end

  def get_cell_rs(region, sub_index)
    row, col = get_row_col_from_region_sub_index(region, sub_index)
    get_cell_rc(row - 1, col - 1)
  end

# @param [Square] current_values
# @param [Square] test
  def conflicts?(current_values, test)
    current_values.each { |s|
      if !s.nil? && ((s.across != 0 && s.across == test.across) ||
          (s.down != 0 && s.down == test.down) ||
          (s.region != 0 && s.region == test.region))
        return true if s.value == test.value
      end
    }
    false
  end

  def data
    @sudoku.map { |s| item(s.index, s.value) }
  end

  def data=(data)
    @sudoku = data.map { |s| item(s.index, s.value) }
  end

  Square = Struct::new(:across, :down, :region, :value, :index)

  def item(n, v)
    n += 1
    Square.new(get_across_from_number(n), get_down_from_number(n), get_region_from_number(n), v, n - 1)
  end

  def get_across_from_number(n)
    k = n % 9
    k == 0 ? 9 : k
  end

  def get_down_from_number(n)
        (get_across_from_number(n) == 9) ? (n / 9).floor : (n / 9).floor + 1
  end

  def get_sub_index_from_number(n)
    a = get_across_from_number(n)
    d = get_down_from_number(n)
    (((d-1) % 3) * 3) + ((a-1) % 3) + 1
  end

  def get_row_col_from_sub_index(s)
    return ((s-1)/3).floor + 1, ((s-1) % 3) + 1
  end

  def get_row_col_from_region_sub_index(r, s)
    row1, col1 = get_row_col_from_sub_index(r)
    row2, col2 = get_row_col_from_sub_index(s)
    return ((row1-1)*3)+row2, ((col1-1)*3)+col2
  end

  def get_region_from_number(n)
    a = get_across_from_number(n)
    d = get_down_from_number(n)
    (((d-1) / 3).floor * 3) + ((a-1) / 3).floor + 1
  end

  def sudoku_unique?
    m         = data
    b         = test_uniqueness == :unique
    self.data = m
    b
  end

  def test_uniqueness
    # Find untouched location with most information
    rowp = 0
    colp = 0
    mp   = nil
    cmp  = 10

    (0...9).each { |row|
      (0...9).each { |col|
        # Is this spot unused?
        if get_cell_rc(row, col).value == 0
          # Set M of possible solutions
          m = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

          # Remove used numbers in the vertical direction
          (0...9).each { |a| m[get_cell_rc(a, col).value] = 0 }

          # Remove used numbers in the horizontal direction
          (0...9).each { |b| m[get_cell_rc(row, b).value] = 0 }

          # Remove used numbers in the sub square.
          square_index = get_cell_rc(row, col).region
          (1...10).each { |c| m[get_cell_rs(square_index, c).value] = 0 }

          cm = 0
          # Calculate cardinality of M
          (1...10).each { |d| cm += m[d] == 0 ? 0 : 1 }

          # Is there more information in this spot than in the best yet?
          if cm < cmp
            cmp  = cm
            mp   = m
            colp = col
            rowp = row
          end
        end
      }
    }

    # Finished?
    return :unique if cmp == 10

    # Couldn't find a solution?
    return :no_solution if cmp == 0

    # Try elements
    success = 0
    (1...10).each { |i|
      if mp[i] != 0
        get_cell_rc(rowp, colp).value = mp[i]

        case test_uniqueness
          when :unique
            success += 1
          when :not_unique
            return :not_unique
          else
            # ignored
        end
      end
    }


    # More than one solution found?
    return :not_unique if success > 1

    # Restore to original state.
    get_cell_rc(rowp, colp).value = 0

    case success
      when 0
        return :no_solution

      when 1
        return :unique

      else
        # Won' t happen.
        return :not_unique
    end
  end

  def to_s
    border = '+-----+-----+-----+'
    str    = ''
    (0...9).each { |i|
      str << border << "\n" if i%3 == 0
      (0...9).each { |j|
        str << (j%3 == 0 ? '|' : ' ')
        cell = get_cell_rc(i, j)
        val  = cell.nil? ? 0 : cell.value
        str << (val == 0 ? '.' : "#{val}")
      }
      str << "|\n"
    }
    str << border
    str
  end

  def to_m(arr = @sudoku)
    matrix = Array.fill2d(9, 9, 0)
    arr.each { |square| matrix[square.down-1][square.across-1] = square.value }
    matrix
  end

  def get_number_spots
    @sudoku.map { |square| ((square.nil? || square.value == 0) ? 0 : 1) }.reduce(&:+)
  end

  #noinspection RubyStringKeysInHashInspection
  def to_json
    matrix1 = to_m
    matrix2 = to_m(@full_sudoku)
    {game: matrix1, full: matrix2}.to_json
    # "{\"game\":#{matrix1.inspect}, \"full\":#{matrix2.inspect}}"
  end
end